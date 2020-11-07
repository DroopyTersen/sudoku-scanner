(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __commonJS = (callback, module) => () => {
    if (!module) {
      module = {exports: {}};
      callback(module.exports, module);
    }
    return module.exports;
  };
  var __exportStar = (target, module, desc) => {
    __markAsModule(target);
    if (typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__defProp(__create(__getProtoOf(module)), "default", {value: module, enumerable: true}), module);
  };

  // node_modules/typed-function/typed-function.js
  var require_typed_function = __commonJS((exports, module) => {
    "use strict";
    (function(root, factory98) {
      if (typeof define === "function" && define.amd) {
        define([], factory98);
      } else if (typeof exports === "object") {
        module.exports = factory98();
      } else {
        root.typed = factory98();
      }
    })(exports, function() {
      function ok() {
        return true;
      }
      function notOk() {
        return false;
      }
      function undef() {
        return void 0;
      }
      function create() {
        var _types = [
          {name: "number", test: function(x) {
            return typeof x === "number";
          }},
          {name: "string", test: function(x) {
            return typeof x === "string";
          }},
          {name: "boolean", test: function(x) {
            return typeof x === "boolean";
          }},
          {name: "Function", test: function(x) {
            return typeof x === "function";
          }},
          {name: "Array", test: Array.isArray},
          {name: "Date", test: function(x) {
            return x instanceof Date;
          }},
          {name: "RegExp", test: function(x) {
            return x instanceof RegExp;
          }},
          {name: "Object", test: function(x) {
            return typeof x === "object" && x !== null && x.constructor === Object;
          }},
          {name: "null", test: function(x) {
            return x === null;
          }},
          {name: "undefined", test: function(x) {
            return x === void 0;
          }}
        ];
        var anyType = {
          name: "any",
          test: ok
        };
        var _ignore = [];
        var _conversions = [];
        var typed2 = {
          types: _types,
          conversions: _conversions,
          ignore: _ignore
        };
        function findTypeByName(typeName) {
          var entry = findInArray(typed2.types, function(entry2) {
            return entry2.name === typeName;
          });
          if (entry) {
            return entry;
          }
          if (typeName === "any") {
            return anyType;
          }
          var hint = findInArray(typed2.types, function(entry2) {
            return entry2.name.toLowerCase() === typeName.toLowerCase();
          });
          throw new TypeError('Unknown type "' + typeName + '"' + (hint ? '. Did you mean "' + hint.name + '"?' : ""));
        }
        function findTypeIndex(type) {
          if (type === anyType) {
            return 999;
          }
          return typed2.types.indexOf(type);
        }
        function findTypeName(value) {
          var entry = findInArray(typed2.types, function(entry2) {
            return entry2.test(value);
          });
          if (entry) {
            return entry.name;
          }
          throw new TypeError("Value has unknown type. Value: " + value);
        }
        function find(fn, signature) {
          if (!fn.signatures) {
            throw new TypeError("Function is no typed-function");
          }
          var arr;
          if (typeof signature === "string") {
            arr = signature.split(",");
            for (var i = 0; i < arr.length; i++) {
              arr[i] = arr[i].trim();
            }
          } else if (Array.isArray(signature)) {
            arr = signature;
          } else {
            throw new TypeError("String array or a comma separated string expected");
          }
          var str = arr.join(",");
          var match = fn.signatures[str];
          if (match) {
            return match;
          }
          throw new TypeError("Signature not found (signature: " + (fn.name || "unnamed") + "(" + arr.join(", ") + "))");
        }
        function convert(value, type) {
          var from = findTypeName(value);
          if (type === from) {
            return value;
          }
          for (var i = 0; i < typed2.conversions.length; i++) {
            var conversion = typed2.conversions[i];
            if (conversion.from === from && conversion.to === type) {
              return conversion.convert(value);
            }
          }
          throw new Error("Cannot convert from " + from + " to " + type);
        }
        function stringifyParams(params) {
          return params.map(function(param) {
            var typeNames = param.types.map(getTypeName);
            return (param.restParam ? "..." : "") + typeNames.join("|");
          }).join(",");
        }
        function parseParam(param, conversions) {
          var restParam = param.indexOf("...") === 0;
          var types = !restParam ? param : param.length > 3 ? param.slice(3) : "any";
          var typeNames = types.split("|").map(trim).filter(notEmpty).filter(notIgnore);
          var matchingConversions = filterConversions(conversions, typeNames);
          var exactTypes = typeNames.map(function(typeName) {
            var type = findTypeByName(typeName);
            return {
              name: typeName,
              typeIndex: findTypeIndex(type),
              test: type.test,
              conversion: null,
              conversionIndex: -1
            };
          });
          var convertibleTypes = matchingConversions.map(function(conversion) {
            var type = findTypeByName(conversion.from);
            return {
              name: conversion.from,
              typeIndex: findTypeIndex(type),
              test: type.test,
              conversion,
              conversionIndex: conversions.indexOf(conversion)
            };
          });
          return {
            types: exactTypes.concat(convertibleTypes),
            restParam
          };
        }
        function parseSignature(signature, fn, conversions) {
          var params = [];
          if (signature.trim() !== "") {
            params = signature.split(",").map(trim).map(function(param, index, array13) {
              var parsedParam = parseParam(param, conversions);
              if (parsedParam.restParam && index !== array13.length - 1) {
                throw new SyntaxError('Unexpected rest parameter "' + param + '": only allowed for the last parameter');
              }
              return parsedParam;
            });
          }
          if (params.some(isInvalidParam)) {
            return null;
          }
          return {
            params,
            fn
          };
        }
        function hasRestParam(params) {
          var param = last(params);
          return param ? param.restParam : false;
        }
        function hasConversions(param) {
          return param.types.some(function(type) {
            return type.conversion != null;
          });
        }
        function compileTest(param) {
          if (!param || param.types.length === 0) {
            return ok;
          } else if (param.types.length === 1) {
            return findTypeByName(param.types[0].name).test;
          } else if (param.types.length === 2) {
            var test0 = findTypeByName(param.types[0].name).test;
            var test1 = findTypeByName(param.types[1].name).test;
            return function or(x) {
              return test0(x) || test1(x);
            };
          } else {
            var tests = param.types.map(function(type) {
              return findTypeByName(type.name).test;
            });
            return function or(x) {
              for (var i = 0; i < tests.length; i++) {
                if (tests[i](x)) {
                  return true;
                }
              }
              return false;
            };
          }
        }
        function compileTests(params) {
          var tests, test0, test1;
          if (hasRestParam(params)) {
            tests = initial(params).map(compileTest);
            var varIndex = tests.length;
            var lastTest = compileTest(last(params));
            var testRestParam = function(args) {
              for (var i = varIndex; i < args.length; i++) {
                if (!lastTest(args[i])) {
                  return false;
                }
              }
              return true;
            };
            return function testArgs(args) {
              for (var i = 0; i < tests.length; i++) {
                if (!tests[i](args[i])) {
                  return false;
                }
              }
              return testRestParam(args) && args.length >= varIndex + 1;
            };
          } else {
            if (params.length === 0) {
              return function testArgs(args) {
                return args.length === 0;
              };
            } else if (params.length === 1) {
              test0 = compileTest(params[0]);
              return function testArgs(args) {
                return test0(args[0]) && args.length === 1;
              };
            } else if (params.length === 2) {
              test0 = compileTest(params[0]);
              test1 = compileTest(params[1]);
              return function testArgs(args) {
                return test0(args[0]) && test1(args[1]) && args.length === 2;
              };
            } else {
              tests = params.map(compileTest);
              return function testArgs(args) {
                for (var i = 0; i < tests.length; i++) {
                  if (!tests[i](args[i])) {
                    return false;
                  }
                }
                return args.length === tests.length;
              };
            }
          }
        }
        function getParamAtIndex(signature, index) {
          return index < signature.params.length ? signature.params[index] : hasRestParam(signature.params) ? last(signature.params) : null;
        }
        function getExpectedTypeNames(signature, index, excludeConversions) {
          var param = getParamAtIndex(signature, index);
          var types = param ? excludeConversions ? param.types.filter(isExactType) : param.types : [];
          return types.map(getTypeName);
        }
        function getTypeName(type) {
          return type.name;
        }
        function isExactType(type) {
          return type.conversion === null || type.conversion === void 0;
        }
        function mergeExpectedParams(signatures, index) {
          var typeNames = uniq(flatMap(signatures, function(signature) {
            return getExpectedTypeNames(signature, index, false);
          }));
          return typeNames.indexOf("any") !== -1 ? ["any"] : typeNames;
        }
        function createError(name94, args, signatures) {
          var err, expected;
          var _name = name94 || "unnamed";
          var matchingSignatures = signatures;
          var index;
          for (index = 0; index < args.length; index++) {
            var nextMatchingDefs = matchingSignatures.filter(function(signature) {
              var test = compileTest(getParamAtIndex(signature, index));
              return (index < signature.params.length || hasRestParam(signature.params)) && test(args[index]);
            });
            if (nextMatchingDefs.length === 0) {
              expected = mergeExpectedParams(matchingSignatures, index);
              if (expected.length > 0) {
                var actualType = findTypeName(args[index]);
                err = new TypeError("Unexpected type of argument in function " + _name + " (expected: " + expected.join(" or ") + ", actual: " + actualType + ", index: " + index + ")");
                err.data = {
                  category: "wrongType",
                  fn: _name,
                  index,
                  actual: actualType,
                  expected
                };
                return err;
              }
            } else {
              matchingSignatures = nextMatchingDefs;
            }
          }
          var lengths = matchingSignatures.map(function(signature) {
            return hasRestParam(signature.params) ? Infinity : signature.params.length;
          });
          if (args.length < Math.min.apply(null, lengths)) {
            expected = mergeExpectedParams(matchingSignatures, index);
            err = new TypeError("Too few arguments in function " + _name + " (expected: " + expected.join(" or ") + ", index: " + args.length + ")");
            err.data = {
              category: "tooFewArgs",
              fn: _name,
              index: args.length,
              expected
            };
            return err;
          }
          var maxLength = Math.max.apply(null, lengths);
          if (args.length > maxLength) {
            err = new TypeError("Too many arguments in function " + _name + " (expected: " + maxLength + ", actual: " + args.length + ")");
            err.data = {
              category: "tooManyArgs",
              fn: _name,
              index: args.length,
              expectedLength: maxLength
            };
            return err;
          }
          err = new TypeError('Arguments of type "' + args.join(", ") + '" do not match any of the defined signatures of function ' + _name + ".");
          err.data = {
            category: "mismatch",
            actual: args.map(findTypeName)
          };
          return err;
        }
        function getLowestTypeIndex(param) {
          var min2 = 999;
          for (var i = 0; i < param.types.length; i++) {
            if (isExactType(param.types[i])) {
              min2 = Math.min(min2, param.types[i].typeIndex);
            }
          }
          return min2;
        }
        function getLowestConversionIndex(param) {
          var min2 = 999;
          for (var i = 0; i < param.types.length; i++) {
            if (!isExactType(param.types[i])) {
              min2 = Math.min(min2, param.types[i].conversionIndex);
            }
          }
          return min2;
        }
        function compareParams(param1, param2) {
          var c;
          c = param1.restParam - param2.restParam;
          if (c !== 0) {
            return c;
          }
          c = hasConversions(param1) - hasConversions(param2);
          if (c !== 0) {
            return c;
          }
          c = getLowestTypeIndex(param1) - getLowestTypeIndex(param2);
          if (c !== 0) {
            return c;
          }
          return getLowestConversionIndex(param1) - getLowestConversionIndex(param2);
        }
        function compareSignatures(signature1, signature2) {
          var len = Math.min(signature1.params.length, signature2.params.length);
          var i;
          var c;
          c = signature1.params.some(hasConversions) - signature2.params.some(hasConversions);
          if (c !== 0) {
            return c;
          }
          for (i = 0; i < len; i++) {
            c = hasConversions(signature1.params[i]) - hasConversions(signature2.params[i]);
            if (c !== 0) {
              return c;
            }
          }
          for (i = 0; i < len; i++) {
            c = compareParams(signature1.params[i], signature2.params[i]);
            if (c !== 0) {
              return c;
            }
          }
          return signature1.params.length - signature2.params.length;
        }
        function filterConversions(conversions, typeNames) {
          var matches = {};
          conversions.forEach(function(conversion) {
            if (typeNames.indexOf(conversion.from) === -1 && typeNames.indexOf(conversion.to) !== -1 && !matches[conversion.from]) {
              matches[conversion.from] = conversion;
            }
          });
          return Object.keys(matches).map(function(from) {
            return matches[from];
          });
        }
        function compileArgsPreprocessing(params, fn) {
          var fnConvert = fn;
          if (params.some(hasConversions)) {
            var restParam = hasRestParam(params);
            var compiledConversions = params.map(compileArgConversion);
            fnConvert = function convertArgs() {
              var args = [];
              var last2 = restParam ? arguments.length - 1 : arguments.length;
              for (var i = 0; i < last2; i++) {
                args[i] = compiledConversions[i](arguments[i]);
              }
              if (restParam) {
                args[last2] = arguments[last2].map(compiledConversions[last2]);
              }
              return fn.apply(this, args);
            };
          }
          var fnPreprocess = fnConvert;
          if (hasRestParam(params)) {
            var offset = params.length - 1;
            fnPreprocess = function preprocessRestParams() {
              return fnConvert.apply(this, slice(arguments, 0, offset).concat([slice(arguments, offset)]));
            };
          }
          return fnPreprocess;
        }
        function compileArgConversion(param) {
          var test0, test1, conversion0, conversion1;
          var tests = [];
          var conversions = [];
          param.types.forEach(function(type) {
            if (type.conversion) {
              tests.push(findTypeByName(type.conversion.from).test);
              conversions.push(type.conversion.convert);
            }
          });
          switch (conversions.length) {
            case 0:
              return function convertArg(arg) {
                return arg;
              };
            case 1:
              test0 = tests[0];
              conversion0 = conversions[0];
              return function convertArg(arg) {
                if (test0(arg)) {
                  return conversion0(arg);
                }
                return arg;
              };
            case 2:
              test0 = tests[0];
              test1 = tests[1];
              conversion0 = conversions[0];
              conversion1 = conversions[1];
              return function convertArg(arg) {
                if (test0(arg)) {
                  return conversion0(arg);
                }
                if (test1(arg)) {
                  return conversion1(arg);
                }
                return arg;
              };
            default:
              return function convertArg(arg) {
                for (var i = 0; i < conversions.length; i++) {
                  if (tests[i](arg)) {
                    return conversions[i](arg);
                  }
                }
                return arg;
              };
          }
        }
        function createSignaturesMap(signatures) {
          var signaturesMap = {};
          signatures.forEach(function(signature) {
            if (!signature.params.some(hasConversions)) {
              splitParams(signature.params, true).forEach(function(params) {
                signaturesMap[stringifyParams(params)] = signature.fn;
              });
            }
          });
          return signaturesMap;
        }
        function splitParams(params, ignoreConversionTypes) {
          function _splitParams(params2, index, types) {
            if (index < params2.length) {
              var param = params2[index];
              var filteredTypes = ignoreConversionTypes ? param.types.filter(isExactType) : param.types;
              var typeGroups;
              if (param.restParam) {
                var exactTypes = filteredTypes.filter(isExactType);
                typeGroups = exactTypes.length < filteredTypes.length ? [exactTypes, filteredTypes] : [filteredTypes];
              } else {
                typeGroups = filteredTypes.map(function(type) {
                  return [type];
                });
              }
              return flatMap(typeGroups, function(typeGroup) {
                return _splitParams(params2, index + 1, types.concat([typeGroup]));
              });
            } else {
              var splittedParams = types.map(function(type, typeIndex) {
                return {
                  types: type,
                  restParam: typeIndex === params2.length - 1 && hasRestParam(params2)
                };
              });
              return [splittedParams];
            }
          }
          return _splitParams(params, 0, []);
        }
        function hasConflictingParams(signature1, signature2) {
          var ii = Math.max(signature1.params.length, signature2.params.length);
          for (var i = 0; i < ii; i++) {
            var typesNames1 = getExpectedTypeNames(signature1, i, true);
            var typesNames2 = getExpectedTypeNames(signature2, i, true);
            if (!hasOverlap(typesNames1, typesNames2)) {
              return false;
            }
          }
          var len1 = signature1.params.length;
          var len2 = signature2.params.length;
          var restParam1 = hasRestParam(signature1.params);
          var restParam2 = hasRestParam(signature2.params);
          return restParam1 ? restParam2 ? len1 === len2 : len2 >= len1 : restParam2 ? len1 >= len2 : len1 === len2;
        }
        function createTypedFunction(name94, signaturesMap) {
          if (Object.keys(signaturesMap).length === 0) {
            throw new SyntaxError("No signatures provided");
          }
          var parsedSignatures = [];
          Object.keys(signaturesMap).map(function(signature) {
            return parseSignature(signature, signaturesMap[signature], typed2.conversions);
          }).filter(notNull).forEach(function(parsedSignature) {
            var conflictingSignature = findInArray(parsedSignatures, function(s) {
              return hasConflictingParams(s, parsedSignature);
            });
            if (conflictingSignature) {
              throw new TypeError('Conflicting signatures "' + stringifyParams(conflictingSignature.params) + '" and "' + stringifyParams(parsedSignature.params) + '".');
            }
            parsedSignatures.push(parsedSignature);
          });
          var signatures = flatMap(parsedSignatures, function(parsedSignature) {
            var params = parsedSignature ? splitParams(parsedSignature.params, false) : [];
            return params.map(function(params2) {
              return {
                params: params2,
                fn: parsedSignature.fn
              };
            });
          }).filter(notNull);
          signatures.sort(compareSignatures);
          var ok0 = signatures[0] && signatures[0].params.length <= 2 && !hasRestParam(signatures[0].params);
          var ok1 = signatures[1] && signatures[1].params.length <= 2 && !hasRestParam(signatures[1].params);
          var ok2 = signatures[2] && signatures[2].params.length <= 2 && !hasRestParam(signatures[2].params);
          var ok3 = signatures[3] && signatures[3].params.length <= 2 && !hasRestParam(signatures[3].params);
          var ok4 = signatures[4] && signatures[4].params.length <= 2 && !hasRestParam(signatures[4].params);
          var ok5 = signatures[5] && signatures[5].params.length <= 2 && !hasRestParam(signatures[5].params);
          var allOk = ok0 && ok1 && ok2 && ok3 && ok4 && ok5;
          var tests = signatures.map(function(signature) {
            return compileTests(signature.params);
          });
          var test00 = ok0 ? compileTest(signatures[0].params[0]) : notOk;
          var test10 = ok1 ? compileTest(signatures[1].params[0]) : notOk;
          var test20 = ok2 ? compileTest(signatures[2].params[0]) : notOk;
          var test30 = ok3 ? compileTest(signatures[3].params[0]) : notOk;
          var test40 = ok4 ? compileTest(signatures[4].params[0]) : notOk;
          var test50 = ok5 ? compileTest(signatures[5].params[0]) : notOk;
          var test01 = ok0 ? compileTest(signatures[0].params[1]) : notOk;
          var test11 = ok1 ? compileTest(signatures[1].params[1]) : notOk;
          var test21 = ok2 ? compileTest(signatures[2].params[1]) : notOk;
          var test31 = ok3 ? compileTest(signatures[3].params[1]) : notOk;
          var test41 = ok4 ? compileTest(signatures[4].params[1]) : notOk;
          var test51 = ok5 ? compileTest(signatures[5].params[1]) : notOk;
          var fns = signatures.map(function(signature) {
            return compileArgsPreprocessing(signature.params, signature.fn);
          });
          var fn0 = ok0 ? fns[0] : undef;
          var fn1 = ok1 ? fns[1] : undef;
          var fn2 = ok2 ? fns[2] : undef;
          var fn3 = ok3 ? fns[3] : undef;
          var fn4 = ok4 ? fns[4] : undef;
          var fn5 = ok5 ? fns[5] : undef;
          var len0 = ok0 ? signatures[0].params.length : -1;
          var len1 = ok1 ? signatures[1].params.length : -1;
          var len2 = ok2 ? signatures[2].params.length : -1;
          var len3 = ok3 ? signatures[3].params.length : -1;
          var len4 = ok4 ? signatures[4].params.length : -1;
          var len5 = ok5 ? signatures[5].params.length : -1;
          var iStart = allOk ? 6 : 0;
          var iEnd = signatures.length;
          var generic = function generic2() {
            "use strict";
            for (var i = iStart; i < iEnd; i++) {
              if (tests[i](arguments)) {
                return fns[i].apply(this, arguments);
              }
            }
            throw createError(name94, arguments, signatures);
          };
          var fn = function fn6(arg0, arg1) {
            "use strict";
            if (arguments.length === len0 && test00(arg0) && test01(arg1)) {
              return fn0.apply(fn6, arguments);
            }
            if (arguments.length === len1 && test10(arg0) && test11(arg1)) {
              return fn1.apply(fn6, arguments);
            }
            if (arguments.length === len2 && test20(arg0) && test21(arg1)) {
              return fn2.apply(fn6, arguments);
            }
            if (arguments.length === len3 && test30(arg0) && test31(arg1)) {
              return fn3.apply(fn6, arguments);
            }
            if (arguments.length === len4 && test40(arg0) && test41(arg1)) {
              return fn4.apply(fn6, arguments);
            }
            if (arguments.length === len5 && test50(arg0) && test51(arg1)) {
              return fn5.apply(fn6, arguments);
            }
            return generic.apply(fn6, arguments);
          };
          try {
            Object.defineProperty(fn, "name", {value: name94});
          } catch (err) {
          }
          fn.signatures = createSignaturesMap(signatures);
          return fn;
        }
        function notIgnore(typeName) {
          return typed2.ignore.indexOf(typeName) === -1;
        }
        function trim(str) {
          return str.trim();
        }
        function notEmpty(str) {
          return !!str;
        }
        function notNull(value) {
          return value !== null;
        }
        function isInvalidParam(param) {
          return param.types.length === 0;
        }
        function initial(arr) {
          return arr.slice(0, arr.length - 1);
        }
        function last(arr) {
          return arr[arr.length - 1];
        }
        function slice(arr, start, end) {
          return Array.prototype.slice.call(arr, start, end);
        }
        function contains(array13, item) {
          return array13.indexOf(item) !== -1;
        }
        function hasOverlap(array1, array22) {
          for (var i = 0; i < array1.length; i++) {
            if (contains(array22, array1[i])) {
              return true;
            }
          }
          return false;
        }
        function findInArray(arr, test) {
          for (var i = 0; i < arr.length; i++) {
            if (test(arr[i])) {
              return arr[i];
            }
          }
          return void 0;
        }
        function uniq(arr) {
          var entries = {};
          for (var i = 0; i < arr.length; i++) {
            entries[arr[i]] = true;
          }
          return Object.keys(entries);
        }
        function flatMap(arr, callback) {
          return Array.prototype.concat.apply([], arr.map(callback));
        }
        function getName(fns) {
          var name94 = "";
          for (var i = 0; i < fns.length; i++) {
            var fn = fns[i];
            if ((typeof fn.signatures === "object" || typeof fn.signature === "string") && fn.name !== "") {
              if (name94 === "") {
                name94 = fn.name;
              } else if (name94 !== fn.name) {
                var err = new Error("Function names do not match (expected: " + name94 + ", actual: " + fn.name + ")");
                err.data = {
                  actual: fn.name,
                  expected: name94
                };
                throw err;
              }
            }
          }
          return name94;
        }
        function extractSignatures(fns) {
          var err;
          var signaturesMap = {};
          function validateUnique(_signature, _fn) {
            if (signaturesMap.hasOwnProperty(_signature) && _fn !== signaturesMap[_signature]) {
              err = new Error('Signature "' + _signature + '" is defined twice');
              err.data = {signature: _signature};
              throw err;
            }
          }
          for (var i = 0; i < fns.length; i++) {
            var fn = fns[i];
            if (typeof fn.signatures === "object") {
              for (var signature in fn.signatures) {
                if (fn.signatures.hasOwnProperty(signature)) {
                  validateUnique(signature, fn.signatures[signature]);
                  signaturesMap[signature] = fn.signatures[signature];
                }
              }
            } else if (typeof fn.signature === "string") {
              validateUnique(fn.signature, fn);
              signaturesMap[fn.signature] = fn;
            } else {
              err = new TypeError("Function is no typed-function (index: " + i + ")");
              err.data = {index: i};
              throw err;
            }
          }
          return signaturesMap;
        }
        typed2 = createTypedFunction("typed", {
          "string, Object": createTypedFunction,
          Object: function(signaturesMap) {
            var fns = [];
            for (var signature in signaturesMap) {
              if (signaturesMap.hasOwnProperty(signature)) {
                fns.push(signaturesMap[signature]);
              }
            }
            var name94 = getName(fns);
            return createTypedFunction(name94, signaturesMap);
          },
          "...Function": function(fns) {
            return createTypedFunction(getName(fns), extractSignatures(fns));
          },
          "string, ...Function": function(name94, fns) {
            return createTypedFunction(name94, extractSignatures(fns));
          }
        });
        typed2.create = create;
        typed2.types = _types;
        typed2.conversions = _conversions;
        typed2.ignore = _ignore;
        typed2.convert = convert;
        typed2.find = find;
        typed2.addType = function(type, beforeObjectTest) {
          if (!type || typeof type.name !== "string" || typeof type.test !== "function") {
            throw new TypeError("Object with properties {name: string, test: function} expected");
          }
          if (beforeObjectTest !== false) {
            for (var i = 0; i < typed2.types.length; i++) {
              if (typed2.types[i].name === "Object") {
                typed2.types.splice(i, 0, type);
                return;
              }
            }
          }
          typed2.types.push(type);
        };
        typed2.addConversion = function(conversion) {
          if (!conversion || typeof conversion.from !== "string" || typeof conversion.to !== "string" || typeof conversion.convert !== "function") {
            throw new TypeError("Object with properties {from: string, to: string, convert: function} expected");
          }
          typed2.conversions.push(conversion);
        };
        return typed2;
      }
      return create();
    });
  });

  // node_modules/decimal.js/decimal.js
  var require_decimal = __commonJS((exports, module) => {
    (function(globalScope) {
      "use strict";
      var EXP_LIMIT = 9e15, MAX_DIGITS = 1e9, NUMERALS = "0123456789abcdef", LN102 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058", PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789", DEFAULTS = {
        precision: 20,
        rounding: 4,
        modulo: 1,
        toExpNeg: -7,
        toExpPos: 21,
        minE: -EXP_LIMIT,
        maxE: EXP_LIMIT,
        crypto: false
      }, Decimal4, inexact, noConflict, quadrant, external = true, decimalError = "[DecimalError] ", invalidArgument = decimalError + "Invalid argument: ", precisionLimitExceeded = decimalError + "Precision limit exceeded", cryptoUnavailable = decimalError + "crypto unavailable", mathfloor = Math.floor, mathpow = Math.pow, isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, LN10_PRECISION = LN102.length - 1, PI_PRECISION = PI.length - 1, P = {name: "[object Decimal]"};
      P.absoluteValue = P.abs = function() {
        var x = new this.constructor(this);
        if (x.s < 0)
          x.s = 1;
        return finalise(x);
      };
      P.ceil = function() {
        return finalise(new this.constructor(this), this.e + 1, 2);
      };
      P.comparedTo = P.cmp = function(y) {
        var i, j, xdL, ydL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
        if (!xd || !yd) {
          return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
        }
        if (!xd[0] || !yd[0])
          return xd[0] ? xs : yd[0] ? -ys : 0;
        if (xs !== ys)
          return xs;
        if (x.e !== y.e)
          return x.e > y.e ^ xs < 0 ? 1 : -1;
        xdL = xd.length;
        ydL = yd.length;
        for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
          if (xd[i] !== yd[i])
            return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
        }
        return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
      };
      P.cosine = P.cos = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.d)
          return new Ctor(NaN);
        if (!x.d[0])
          return new Ctor(1);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
        Ctor.rounding = 1;
        x = cosine(Ctor, toLessThanHalfPi(Ctor, x));
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
      };
      P.cubeRoot = P.cbrt = function() {
        var e3, m, n, r, rep, s, sd, t, t3, t3plusx, x = this, Ctor = x.constructor;
        if (!x.isFinite() || x.isZero())
          return new Ctor(x);
        external = false;
        s = x.s * mathpow(x.s * x, 1 / 3);
        if (!s || Math.abs(s) == 1 / 0) {
          n = digitsToString(x.d);
          e3 = x.e;
          if (s = (e3 - n.length + 1) % 3)
            n += s == 1 || s == -2 ? "0" : "00";
          s = mathpow(n, 1 / 3);
          e3 = mathfloor((e3 + 1) / 3) - (e3 % 3 == (e3 < 0 ? -1 : 2));
          if (s == 1 / 0) {
            n = "5e" + e3;
          } else {
            n = s.toExponential();
            n = n.slice(0, n.indexOf("e") + 1) + e3;
          }
          r = new Ctor(n);
          r.s = x.s;
        } else {
          r = new Ctor(s.toString());
        }
        sd = (e3 = Ctor.precision) + 3;
        for (; ; ) {
          t = r;
          t3 = t.times(t).times(t);
          t3plusx = t3.plus(x);
          r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);
          if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
            n = n.slice(sd - 3, sd + 1);
            if (n == "9999" || !rep && n == "4999") {
              if (!rep) {
                finalise(t, e3 + 1, 0);
                if (t.times(t).times(t).eq(x)) {
                  r = t;
                  break;
                }
              }
              sd += 4;
              rep = 1;
            } else {
              if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
                finalise(r, e3 + 1, 1);
                m = !r.times(r).times(r).eq(x);
              }
              break;
            }
          }
        }
        external = true;
        return finalise(r, e3, Ctor.rounding, m);
      };
      P.decimalPlaces = P.dp = function() {
        var w, d = this.d, n = NaN;
        if (d) {
          w = d.length - 1;
          n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
          w = d[w];
          if (w)
            for (; w % 10 == 0; w /= 10)
              n--;
          if (n < 0)
            n = 0;
        }
        return n;
      };
      P.dividedBy = P.div = function(y) {
        return divide(this, new this.constructor(y));
      };
      P.dividedToIntegerBy = P.divToInt = function(y) {
        var x = this, Ctor = x.constructor;
        return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
      };
      P.equals = P.eq = function(y) {
        return this.cmp(y) === 0;
      };
      P.floor = function() {
        return finalise(new this.constructor(this), this.e + 1, 3);
      };
      P.greaterThan = P.gt = function(y) {
        return this.cmp(y) > 0;
      };
      P.greaterThanOrEqualTo = P.gte = function(y) {
        var k = this.cmp(y);
        return k == 1 || k === 0;
      };
      P.hyperbolicCosine = P.cosh = function() {
        var k, n, pr, rm, len, x = this, Ctor = x.constructor, one = new Ctor(1);
        if (!x.isFinite())
          return new Ctor(x.s ? 1 / 0 : NaN);
        if (x.isZero())
          return one;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
        Ctor.rounding = 1;
        len = x.d.length;
        if (len < 32) {
          k = Math.ceil(len / 3);
          n = (1 / tinyPow(4, k)).toString();
        } else {
          k = 16;
          n = "2.3283064365386962890625e-10";
        }
        x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);
        var cosh2_x, i = k, d8 = new Ctor(8);
        for (; i--; ) {
          cosh2_x = x.times(x);
          x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
        }
        return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
      };
      P.hyperbolicSine = P.sinh = function() {
        var k, pr, rm, len, x = this, Ctor = x.constructor;
        if (!x.isFinite() || x.isZero())
          return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
        Ctor.rounding = 1;
        len = x.d.length;
        if (len < 3) {
          x = taylorSeries(Ctor, 2, x, x, true);
        } else {
          k = 1.4 * Math.sqrt(len);
          k = k > 16 ? 16 : k | 0;
          x = x.times(1 / tinyPow(5, k));
          x = taylorSeries(Ctor, 2, x, x, true);
          var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
          for (; k--; ) {
            sinh2_x = x.times(x);
            x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
          }
        }
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(x, pr, rm, true);
      };
      P.hyperbolicTangent = P.tanh = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite())
          return new Ctor(x.s);
        if (x.isZero())
          return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + 7;
        Ctor.rounding = 1;
        return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
      };
      P.inverseCosine = P.acos = function() {
        var halfPi, x = this, Ctor = x.constructor, k = x.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
        if (k !== -1) {
          return k === 0 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
        }
        if (x.isZero())
          return getPi(Ctor, pr + 4, rm).times(0.5);
        Ctor.precision = pr + 6;
        Ctor.rounding = 1;
        x = x.asin();
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return halfPi.minus(x);
      };
      P.inverseHyperbolicCosine = P.acosh = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (x.lte(1))
          return new Ctor(x.eq(1) ? 0 : NaN);
        if (!x.isFinite())
          return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
        Ctor.rounding = 1;
        external = false;
        x = x.times(x).minus(1).sqrt().plus(x);
        external = true;
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.ln();
      };
      P.inverseHyperbolicSine = P.asinh = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite() || x.isZero())
          return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
        Ctor.rounding = 1;
        external = false;
        x = x.times(x).plus(1).sqrt().plus(x);
        external = true;
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.ln();
      };
      P.inverseHyperbolicTangent = P.atanh = function() {
        var pr, rm, wpr, xsd, x = this, Ctor = x.constructor;
        if (!x.isFinite())
          return new Ctor(NaN);
        if (x.e >= 0)
          return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        xsd = x.sd();
        if (Math.max(xsd, pr) < 2 * -x.e - 1)
          return finalise(new Ctor(x), pr, rm, true);
        Ctor.precision = wpr = xsd - x.e;
        x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);
        Ctor.precision = pr + 4;
        Ctor.rounding = 1;
        x = x.ln();
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.times(0.5);
      };
      P.inverseSine = P.asin = function() {
        var halfPi, k, pr, rm, x = this, Ctor = x.constructor;
        if (x.isZero())
          return new Ctor(x);
        k = x.abs().cmp(1);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        if (k !== -1) {
          if (k === 0) {
            halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
            halfPi.s = x.s;
            return halfPi;
          }
          return new Ctor(NaN);
        }
        Ctor.precision = pr + 6;
        Ctor.rounding = 1;
        x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return x.times(2);
      };
      P.inverseTangent = P.atan = function() {
        var i, j, k, n, px, t, r, wpr, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
        if (!x.isFinite()) {
          if (!x.s)
            return new Ctor(NaN);
          if (pr + 4 <= PI_PRECISION) {
            r = getPi(Ctor, pr + 4, rm).times(0.5);
            r.s = x.s;
            return r;
          }
        } else if (x.isZero()) {
          return new Ctor(x);
        } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
          r = getPi(Ctor, pr + 4, rm).times(0.25);
          r.s = x.s;
          return r;
        }
        Ctor.precision = wpr = pr + 10;
        Ctor.rounding = 1;
        k = Math.min(28, wpr / LOG_BASE + 2 | 0);
        for (i = k; i; --i)
          x = x.div(x.times(x).plus(1).sqrt().plus(1));
        external = false;
        j = Math.ceil(wpr / LOG_BASE);
        n = 1;
        x2 = x.times(x);
        r = new Ctor(x);
        px = x;
        for (; i !== -1; ) {
          px = px.times(x2);
          t = r.minus(px.div(n += 2));
          px = px.times(x2);
          r = t.plus(px.div(n += 2));
          if (r.d[j] !== void 0)
            for (i = j; r.d[i] === t.d[i] && i--; )
              ;
        }
        if (k)
          r = r.times(2 << k - 1);
        external = true;
        return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
      };
      P.isFinite = function() {
        return !!this.d;
      };
      P.isInteger = P.isInt = function() {
        return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
      };
      P.isNaN = function() {
        return !this.s;
      };
      P.isNegative = P.isNeg = function() {
        return this.s < 0;
      };
      P.isPositive = P.isPos = function() {
        return this.s > 0;
      };
      P.isZero = function() {
        return !!this.d && this.d[0] === 0;
      };
      P.lessThan = P.lt = function(y) {
        return this.cmp(y) < 0;
      };
      P.lessThanOrEqualTo = P.lte = function(y) {
        return this.cmp(y) < 1;
      };
      P.logarithm = P.log = function(base) {
        var isBase10, d, denominator, k, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
        if (base == null) {
          base = new Ctor(10);
          isBase10 = true;
        } else {
          base = new Ctor(base);
          d = base.d;
          if (base.s < 0 || !d || !d[0] || base.eq(1))
            return new Ctor(NaN);
          isBase10 = base.eq(10);
        }
        d = arg.d;
        if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
          return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
        }
        if (isBase10) {
          if (d.length > 1) {
            inf = true;
          } else {
            for (k = d[0]; k % 10 === 0; )
              k /= 10;
            inf = k !== 1;
          }
        }
        external = false;
        sd = pr + guard;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        r = divide(num, denominator, sd, 1);
        if (checkRoundingDigits(r.d, k = pr, rm)) {
          do {
            sd += 10;
            num = naturalLogarithm(arg, sd);
            denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
            r = divide(num, denominator, sd, 1);
            if (!inf) {
              if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
                r = finalise(r, pr + 1, 0);
              }
              break;
            }
          } while (checkRoundingDigits(r.d, k += 10, rm));
        }
        external = true;
        return finalise(r, pr, rm);
      };
      P.minus = P.sub = function(y) {
        var d, e3, i, j, k, len, pr, rm, xd, xe, xLTy, yd, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        if (!x.d || !y.d) {
          if (!x.s || !y.s)
            y = new Ctor(NaN);
          else if (x.d)
            y.s = -y.s;
          else
            y = new Ctor(y.d || x.s !== y.s ? x : NaN);
          return y;
        }
        if (x.s != y.s) {
          y.s = -y.s;
          return x.plus(y);
        }
        xd = x.d;
        yd = y.d;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        if (!xd[0] || !yd[0]) {
          if (yd[0])
            y.s = -y.s;
          else if (xd[0])
            y = new Ctor(x);
          else
            return new Ctor(rm === 3 ? -0 : 0);
          return external ? finalise(y, pr, rm) : y;
        }
        e3 = mathfloor(y.e / LOG_BASE);
        xe = mathfloor(x.e / LOG_BASE);
        xd = xd.slice();
        k = xe - e3;
        if (k) {
          xLTy = k < 0;
          if (xLTy) {
            d = xd;
            k = -k;
            len = yd.length;
          } else {
            d = yd;
            e3 = xe;
            len = xd.length;
          }
          i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
          if (k > i) {
            k = i;
            d.length = 1;
          }
          d.reverse();
          for (i = k; i--; )
            d.push(0);
          d.reverse();
        } else {
          i = xd.length;
          len = yd.length;
          xLTy = i < len;
          if (xLTy)
            len = i;
          for (i = 0; i < len; i++) {
            if (xd[i] != yd[i]) {
              xLTy = xd[i] < yd[i];
              break;
            }
          }
          k = 0;
        }
        if (xLTy) {
          d = xd;
          xd = yd;
          yd = d;
          y.s = -y.s;
        }
        len = xd.length;
        for (i = yd.length - len; i > 0; --i)
          xd[len++] = 0;
        for (i = yd.length; i > k; ) {
          if (xd[--i] < yd[i]) {
            for (j = i; j && xd[--j] === 0; )
              xd[j] = BASE - 1;
            --xd[j];
            xd[i] += BASE;
          }
          xd[i] -= yd[i];
        }
        for (; xd[--len] === 0; )
          xd.pop();
        for (; xd[0] === 0; xd.shift())
          --e3;
        if (!xd[0])
          return new Ctor(rm === 3 ? -0 : 0);
        y.d = xd;
        y.e = getBase10Exponent(xd, e3);
        return external ? finalise(y, pr, rm) : y;
      };
      P.modulo = P.mod = function(y) {
        var q, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        if (!x.d || !y.s || y.d && !y.d[0])
          return new Ctor(NaN);
        if (!y.d || x.d && !x.d[0]) {
          return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
        }
        external = false;
        if (Ctor.modulo == 9) {
          q = divide(x, y.abs(), 0, 3, 1);
          q.s *= y.s;
        } else {
          q = divide(x, y, 0, Ctor.modulo, 1);
        }
        q = q.times(y);
        external = true;
        return x.minus(q);
      };
      P.naturalExponential = P.exp = function() {
        return naturalExponential(this);
      };
      P.naturalLogarithm = P.ln = function() {
        return naturalLogarithm(this);
      };
      P.negated = P.neg = function() {
        var x = new this.constructor(this);
        x.s = -x.s;
        return finalise(x);
      };
      P.plus = P.add = function(y) {
        var carry, d, e3, i, k, len, pr, rm, xd, yd, x = this, Ctor = x.constructor;
        y = new Ctor(y);
        if (!x.d || !y.d) {
          if (!x.s || !y.s)
            y = new Ctor(NaN);
          else if (!x.d)
            y = new Ctor(y.d || x.s === y.s ? x : NaN);
          return y;
        }
        if (x.s != y.s) {
          y.s = -y.s;
          return x.minus(y);
        }
        xd = x.d;
        yd = y.d;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        if (!xd[0] || !yd[0]) {
          if (!yd[0])
            y = new Ctor(x);
          return external ? finalise(y, pr, rm) : y;
        }
        k = mathfloor(x.e / LOG_BASE);
        e3 = mathfloor(y.e / LOG_BASE);
        xd = xd.slice();
        i = k - e3;
        if (i) {
          if (i < 0) {
            d = xd;
            i = -i;
            len = yd.length;
          } else {
            d = yd;
            e3 = k;
            len = xd.length;
          }
          k = Math.ceil(pr / LOG_BASE);
          len = k > len ? k + 1 : len + 1;
          if (i > len) {
            i = len;
            d.length = 1;
          }
          d.reverse();
          for (; i--; )
            d.push(0);
          d.reverse();
        }
        len = xd.length;
        i = yd.length;
        if (len - i < 0) {
          i = len;
          d = yd;
          yd = xd;
          xd = d;
        }
        for (carry = 0; i; ) {
          carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
          xd[i] %= BASE;
        }
        if (carry) {
          xd.unshift(carry);
          ++e3;
        }
        for (len = xd.length; xd[--len] == 0; )
          xd.pop();
        y.d = xd;
        y.e = getBase10Exponent(xd, e3);
        return external ? finalise(y, pr, rm) : y;
      };
      P.precision = P.sd = function(z) {
        var k, x = this;
        if (z !== void 0 && z !== !!z && z !== 1 && z !== 0)
          throw Error(invalidArgument + z);
        if (x.d) {
          k = getPrecision(x.d);
          if (z && x.e + 1 > k)
            k = x.e + 1;
        } else {
          k = NaN;
        }
        return k;
      };
      P.round = function() {
        var x = this, Ctor = x.constructor;
        return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
      };
      P.sine = P.sin = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite())
          return new Ctor(NaN);
        if (x.isZero())
          return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
        Ctor.rounding = 1;
        x = sine(Ctor, toLessThanHalfPi(Ctor, x));
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
      };
      P.squareRoot = P.sqrt = function() {
        var m, n, sd, r, rep, t, x = this, d = x.d, e3 = x.e, s = x.s, Ctor = x.constructor;
        if (s !== 1 || !d || !d[0]) {
          return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
        }
        external = false;
        s = Math.sqrt(+x);
        if (s == 0 || s == 1 / 0) {
          n = digitsToString(d);
          if ((n.length + e3) % 2 == 0)
            n += "0";
          s = Math.sqrt(n);
          e3 = mathfloor((e3 + 1) / 2) - (e3 < 0 || e3 % 2);
          if (s == 1 / 0) {
            n = "5e" + e3;
          } else {
            n = s.toExponential();
            n = n.slice(0, n.indexOf("e") + 1) + e3;
          }
          r = new Ctor(n);
        } else {
          r = new Ctor(s.toString());
        }
        sd = (e3 = Ctor.precision) + 3;
        for (; ; ) {
          t = r;
          r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);
          if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
            n = n.slice(sd - 3, sd + 1);
            if (n == "9999" || !rep && n == "4999") {
              if (!rep) {
                finalise(t, e3 + 1, 0);
                if (t.times(t).eq(x)) {
                  r = t;
                  break;
                }
              }
              sd += 4;
              rep = 1;
            } else {
              if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
                finalise(r, e3 + 1, 1);
                m = !r.times(r).eq(x);
              }
              break;
            }
          }
        }
        external = true;
        return finalise(r, e3, Ctor.rounding, m);
      };
      P.tangent = P.tan = function() {
        var pr, rm, x = this, Ctor = x.constructor;
        if (!x.isFinite())
          return new Ctor(NaN);
        if (x.isZero())
          return new Ctor(x);
        pr = Ctor.precision;
        rm = Ctor.rounding;
        Ctor.precision = pr + 10;
        Ctor.rounding = 1;
        x = x.sin();
        x.s = 1;
        x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);
        Ctor.precision = pr;
        Ctor.rounding = rm;
        return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
      };
      P.times = P.mul = function(y) {
        var carry, e3, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
        y.s *= x.s;
        if (!xd || !xd[0] || !yd || !yd[0]) {
          return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y.s / 0 : y.s * 0);
        }
        e3 = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
        xdL = xd.length;
        ydL = yd.length;
        if (xdL < ydL) {
          r = xd;
          xd = yd;
          yd = r;
          rL = xdL;
          xdL = ydL;
          ydL = rL;
        }
        r = [];
        rL = xdL + ydL;
        for (i = rL; i--; )
          r.push(0);
        for (i = ydL; --i >= 0; ) {
          carry = 0;
          for (k = xdL + i; k > i; ) {
            t = r[k] + yd[i] * xd[k - i - 1] + carry;
            r[k--] = t % BASE | 0;
            carry = t / BASE | 0;
          }
          r[k] = (r[k] + carry) % BASE | 0;
        }
        for (; !r[--rL]; )
          r.pop();
        if (carry)
          ++e3;
        else
          r.shift();
        y.d = r;
        y.e = getBase10Exponent(r, e3);
        return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
      };
      P.toBinary = function(sd, rm) {
        return toStringBinary(this, 2, sd, rm);
      };
      P.toDecimalPlaces = P.toDP = function(dp, rm) {
        var x = this, Ctor = x.constructor;
        x = new Ctor(x);
        if (dp === void 0)
          return x;
        checkInt32(dp, 0, MAX_DIGITS);
        if (rm === void 0)
          rm = Ctor.rounding;
        else
          checkInt32(rm, 0, 8);
        return finalise(x, dp + x.e + 1, rm);
      };
      P.toExponential = function(dp, rm) {
        var str, x = this, Ctor = x.constructor;
        if (dp === void 0) {
          str = finiteToString(x, true);
        } else {
          checkInt32(dp, 0, MAX_DIGITS);
          if (rm === void 0)
            rm = Ctor.rounding;
          else
            checkInt32(rm, 0, 8);
          x = finalise(new Ctor(x), dp + 1, rm);
          str = finiteToString(x, true, dp + 1);
        }
        return x.isNeg() && !x.isZero() ? "-" + str : str;
      };
      P.toFixed = function(dp, rm) {
        var str, y, x = this, Ctor = x.constructor;
        if (dp === void 0) {
          str = finiteToString(x);
        } else {
          checkInt32(dp, 0, MAX_DIGITS);
          if (rm === void 0)
            rm = Ctor.rounding;
          else
            checkInt32(rm, 0, 8);
          y = finalise(new Ctor(x), dp + x.e + 1, rm);
          str = finiteToString(y, false, dp + y.e + 1);
        }
        return x.isNeg() && !x.isZero() ? "-" + str : str;
      };
      P.toFraction = function(maxD) {
        var d, d0, d1, d2, e3, k, n, n0, n14, pr, q, r, x = this, xd = x.d, Ctor = x.constructor;
        if (!xd)
          return new Ctor(x);
        n14 = d0 = new Ctor(1);
        d1 = n0 = new Ctor(0);
        d = new Ctor(d1);
        e3 = d.e = getPrecision(xd) - x.e - 1;
        k = e3 % LOG_BASE;
        d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
        if (maxD == null) {
          maxD = e3 > 0 ? d : n14;
        } else {
          n = new Ctor(maxD);
          if (!n.isInt() || n.lt(n14))
            throw Error(invalidArgument + n);
          maxD = n.gt(d) ? e3 > 0 ? d : n14 : n;
        }
        external = false;
        n = new Ctor(digitsToString(xd));
        pr = Ctor.precision;
        Ctor.precision = e3 = xd.length * LOG_BASE * 2;
        for (; ; ) {
          q = divide(n, d, 0, 1, 1);
          d2 = d0.plus(q.times(d1));
          if (d2.cmp(maxD) == 1)
            break;
          d0 = d1;
          d1 = d2;
          d2 = n14;
          n14 = n0.plus(q.times(d2));
          n0 = d2;
          d2 = d;
          d = n.minus(q.times(d2));
          n = d2;
        }
        d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
        n0 = n0.plus(d2.times(n14));
        d0 = d0.plus(d2.times(d1));
        n0.s = n14.s = x.s;
        r = divide(n14, d1, e3, 1).minus(x).abs().cmp(divide(n0, d0, e3, 1).minus(x).abs()) < 1 ? [n14, d1] : [n0, d0];
        Ctor.precision = pr;
        external = true;
        return r;
      };
      P.toHexadecimal = P.toHex = function(sd, rm) {
        return toStringBinary(this, 16, sd, rm);
      };
      P.toNearest = function(y, rm) {
        var x = this, Ctor = x.constructor;
        x = new Ctor(x);
        if (y == null) {
          if (!x.d)
            return x;
          y = new Ctor(1);
          rm = Ctor.rounding;
        } else {
          y = new Ctor(y);
          if (rm === void 0) {
            rm = Ctor.rounding;
          } else {
            checkInt32(rm, 0, 8);
          }
          if (!x.d)
            return y.s ? x : y;
          if (!y.d) {
            if (y.s)
              y.s = x.s;
            return y;
          }
        }
        if (y.d[0]) {
          external = false;
          x = divide(x, y, 0, rm, 1).times(y);
          external = true;
          finalise(x);
        } else {
          y.s = x.s;
          x = y;
        }
        return x;
      };
      P.toNumber = function() {
        return +this;
      };
      P.toOctal = function(sd, rm) {
        return toStringBinary(this, 8, sd, rm);
      };
      P.toPower = P.pow = function(y) {
        var e3, k, pr, r, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
        if (!x.d || !y.d || !x.d[0] || !y.d[0])
          return new Ctor(mathpow(+x, yn));
        x = new Ctor(x);
        if (x.eq(1))
          return x;
        pr = Ctor.precision;
        rm = Ctor.rounding;
        if (y.eq(1))
          return finalise(x, pr, rm);
        e3 = mathfloor(y.e / LOG_BASE);
        if (e3 >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
          r = intPow(Ctor, x, k, pr);
          return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
        }
        s = x.s;
        if (s < 0) {
          if (e3 < y.d.length - 1)
            return new Ctor(NaN);
          if ((y.d[e3] & 1) == 0)
            s = 1;
          if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
            x.s = s;
            return x;
          }
        }
        k = mathpow(+x, yn);
        e3 = k == 0 || !isFinite(k) ? mathfloor(yn * (Math.log("0." + digitsToString(x.d)) / Math.LN10 + x.e + 1)) : new Ctor(k + "").e;
        if (e3 > Ctor.maxE + 1 || e3 < Ctor.minE - 1)
          return new Ctor(e3 > 0 ? s / 0 : 0);
        external = false;
        Ctor.rounding = x.s = 1;
        k = Math.min(12, (e3 + "").length);
        r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);
        if (r.d) {
          r = finalise(r, pr + 5, 1);
          if (checkRoundingDigits(r.d, pr, rm)) {
            e3 = pr + 10;
            r = finalise(naturalExponential(y.times(naturalLogarithm(x, e3 + k)), e3), e3 + 5, 1);
            if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
              r = finalise(r, pr + 1, 0);
            }
          }
        }
        r.s = s;
        external = true;
        Ctor.rounding = rm;
        return finalise(r, pr, rm);
      };
      P.toPrecision = function(sd, rm) {
        var str, x = this, Ctor = x.constructor;
        if (sd === void 0) {
          str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        } else {
          checkInt32(sd, 1, MAX_DIGITS);
          if (rm === void 0)
            rm = Ctor.rounding;
          else
            checkInt32(rm, 0, 8);
          x = finalise(new Ctor(x), sd, rm);
          str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
        }
        return x.isNeg() && !x.isZero() ? "-" + str : str;
      };
      P.toSignificantDigits = P.toSD = function(sd, rm) {
        var x = this, Ctor = x.constructor;
        if (sd === void 0) {
          sd = Ctor.precision;
          rm = Ctor.rounding;
        } else {
          checkInt32(sd, 1, MAX_DIGITS);
          if (rm === void 0)
            rm = Ctor.rounding;
          else
            checkInt32(rm, 0, 8);
        }
        return finalise(new Ctor(x), sd, rm);
      };
      P.toString = function() {
        var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        return x.isNeg() && !x.isZero() ? "-" + str : str;
      };
      P.truncated = P.trunc = function() {
        return finalise(new this.constructor(this), this.e + 1, 1);
      };
      P.valueOf = P.toJSON = function() {
        var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
        return x.isNeg() ? "-" + str : str;
      };
      function digitsToString(d) {
        var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
        if (indexOfLastWord > 0) {
          str += w;
          for (i = 1; i < indexOfLastWord; i++) {
            ws = d[i] + "";
            k = LOG_BASE - ws.length;
            if (k)
              str += getZeroString(k);
            str += ws;
          }
          w = d[i];
          ws = w + "";
          k = LOG_BASE - ws.length;
          if (k)
            str += getZeroString(k);
        } else if (w === 0) {
          return "0";
        }
        for (; w % 10 === 0; )
          w /= 10;
        return str + w;
      }
      function checkInt32(i, min3, max3) {
        if (i !== ~~i || i < min3 || i > max3) {
          throw Error(invalidArgument + i);
        }
      }
      function checkRoundingDigits(d, i, rm, repeating) {
        var di, k, r, rd;
        for (k = d[0]; k >= 10; k /= 10)
          --i;
        if (--i < 0) {
          i += LOG_BASE;
          di = 0;
        } else {
          di = Math.ceil((i + 1) / LOG_BASE);
          i %= LOG_BASE;
        }
        k = mathpow(10, LOG_BASE - i);
        rd = d[di] % k | 0;
        if (repeating == null) {
          if (i < 3) {
            if (i == 0)
              rd = rd / 100 | 0;
            else if (i == 1)
              rd = rd / 10 | 0;
            r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 5e4 || rd == 0;
          } else {
            r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 || (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
          }
        } else {
          if (i < 4) {
            if (i == 0)
              rd = rd / 1e3 | 0;
            else if (i == 1)
              rd = rd / 100 | 0;
            else if (i == 2)
              rd = rd / 10 | 0;
            r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
          } else {
            r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1e3 | 0) == mathpow(10, i - 3) - 1;
          }
        }
        return r;
      }
      function convertBase(str, baseIn, baseOut) {
        var j, arr = [0], arrL, i = 0, strL = str.length;
        for (; i < strL; ) {
          for (arrL = arr.length; arrL--; )
            arr[arrL] *= baseIn;
          arr[0] += NUMERALS.indexOf(str.charAt(i++));
          for (j = 0; j < arr.length; j++) {
            if (arr[j] > baseOut - 1) {
              if (arr[j + 1] === void 0)
                arr[j + 1] = 0;
              arr[j + 1] += arr[j] / baseOut | 0;
              arr[j] %= baseOut;
            }
          }
        }
        return arr.reverse();
      }
      function cosine(Ctor, x) {
        var k, y, len = x.d.length;
        if (len < 32) {
          k = Math.ceil(len / 3);
          y = (1 / tinyPow(4, k)).toString();
        } else {
          k = 16;
          y = "2.3283064365386962890625e-10";
        }
        Ctor.precision += k;
        x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));
        for (var i = k; i--; ) {
          var cos2x = x.times(x);
          x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
        }
        Ctor.precision -= k;
        return x;
      }
      var divide = function() {
        function multiplyInteger(x, k, base) {
          var temp, carry = 0, i = x.length;
          for (x = x.slice(); i--; ) {
            temp = x[i] * k + carry;
            x[i] = temp % base | 0;
            carry = temp / base | 0;
          }
          if (carry)
            x.unshift(carry);
          return x;
        }
        function compare2(a, b, aL, bL) {
          var i, r;
          if (aL != bL) {
            r = aL > bL ? 1 : -1;
          } else {
            for (i = r = 0; i < aL; i++) {
              if (a[i] != b[i]) {
                r = a[i] > b[i] ? 1 : -1;
                break;
              }
            }
          }
          return r;
        }
        function subtract2(a, b, aL, base) {
          var i = 0;
          for (; aL--; ) {
            a[aL] -= i;
            i = a[aL] < b[aL] ? 1 : 0;
            a[aL] = i * base + a[aL] - b[aL];
          }
          for (; !a[0] && a.length > 1; )
            a.shift();
        }
        return function(x, y, pr, rm, dp, base) {
          var cmp, e3, i, k, logBase, more, prod2, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign3 = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
          if (!xd || !xd[0] || !yd || !yd[0]) {
            return new Ctor(!x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : xd && xd[0] == 0 || !yd ? sign3 * 0 : sign3 / 0);
          }
          if (base) {
            logBase = 1;
            e3 = x.e - y.e;
          } else {
            base = BASE;
            logBase = LOG_BASE;
            e3 = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
          }
          yL = yd.length;
          xL = xd.length;
          q = new Ctor(sign3);
          qd = q.d = [];
          for (i = 0; yd[i] == (xd[i] || 0); i++)
            ;
          if (yd[i] > (xd[i] || 0))
            e3--;
          if (pr == null) {
            sd = pr = Ctor.precision;
            rm = Ctor.rounding;
          } else if (dp) {
            sd = pr + (x.e - y.e) + 1;
          } else {
            sd = pr;
          }
          if (sd < 0) {
            qd.push(1);
            more = true;
          } else {
            sd = sd / logBase + 2 | 0;
            i = 0;
            if (yL == 1) {
              k = 0;
              yd = yd[0];
              sd++;
              for (; (i < xL || k) && sd--; i++) {
                t = k * base + (xd[i] || 0);
                qd[i] = t / yd | 0;
                k = t % yd | 0;
              }
              more = k || i < xL;
            } else {
              k = base / (yd[0] + 1) | 0;
              if (k > 1) {
                yd = multiplyInteger(yd, k, base);
                xd = multiplyInteger(xd, k, base);
                yL = yd.length;
                xL = xd.length;
              }
              xi = yL;
              rem = xd.slice(0, yL);
              remL = rem.length;
              for (; remL < yL; )
                rem[remL++] = 0;
              yz = yd.slice();
              yz.unshift(0);
              yd0 = yd[0];
              if (yd[1] >= base / 2)
                ++yd0;
              do {
                k = 0;
                cmp = compare2(yd, rem, yL, remL);
                if (cmp < 0) {
                  rem0 = rem[0];
                  if (yL != remL)
                    rem0 = rem0 * base + (rem[1] || 0);
                  k = rem0 / yd0 | 0;
                  if (k > 1) {
                    if (k >= base)
                      k = base - 1;
                    prod2 = multiplyInteger(yd, k, base);
                    prodL = prod2.length;
                    remL = rem.length;
                    cmp = compare2(prod2, rem, prodL, remL);
                    if (cmp == 1) {
                      k--;
                      subtract2(prod2, yL < prodL ? yz : yd, prodL, base);
                    }
                  } else {
                    if (k == 0)
                      cmp = k = 1;
                    prod2 = yd.slice();
                  }
                  prodL = prod2.length;
                  if (prodL < remL)
                    prod2.unshift(0);
                  subtract2(rem, prod2, remL, base);
                  if (cmp == -1) {
                    remL = rem.length;
                    cmp = compare2(yd, rem, yL, remL);
                    if (cmp < 1) {
                      k++;
                      subtract2(rem, yL < remL ? yz : yd, remL, base);
                    }
                  }
                  remL = rem.length;
                } else if (cmp === 0) {
                  k++;
                  rem = [0];
                }
                qd[i++] = k;
                if (cmp && rem[0]) {
                  rem[remL++] = xd[xi] || 0;
                } else {
                  rem = [xd[xi]];
                  remL = 1;
                }
              } while ((xi++ < xL || rem[0] !== void 0) && sd--);
              more = rem[0] !== void 0;
            }
            if (!qd[0])
              qd.shift();
          }
          if (logBase == 1) {
            q.e = e3;
            inexact = more;
          } else {
            for (i = 1, k = qd[0]; k >= 10; k /= 10)
              i++;
            q.e = i + e3 * logBase - 1;
            finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
          }
          return q;
        };
      }();
      function finalise(x, sd, rm, isTruncated) {
        var digits2, i, j, k, rd, roundUp, w, xd, xdi, Ctor = x.constructor;
        out:
          if (sd != null) {
            xd = x.d;
            if (!xd)
              return x;
            for (digits2 = 1, k = xd[0]; k >= 10; k /= 10)
              digits2++;
            i = sd - digits2;
            if (i < 0) {
              i += LOG_BASE;
              j = sd;
              w = xd[xdi = 0];
              rd = w / mathpow(10, digits2 - j - 1) % 10 | 0;
            } else {
              xdi = Math.ceil((i + 1) / LOG_BASE);
              k = xd.length;
              if (xdi >= k) {
                if (isTruncated) {
                  for (; k++ <= xdi; )
                    xd.push(0);
                  w = rd = 0;
                  digits2 = 1;
                  i %= LOG_BASE;
                  j = i - LOG_BASE + 1;
                } else {
                  break out;
                }
              } else {
                w = k = xd[xdi];
                for (digits2 = 1; k >= 10; k /= 10)
                  digits2++;
                i %= LOG_BASE;
                j = i - LOG_BASE + digits2;
                rd = j < 0 ? 0 : w / mathpow(10, digits2 - j - 1) % 10 | 0;
              }
            }
            isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits2 - j - 1));
            roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && (i > 0 ? j > 0 ? w / mathpow(10, digits2 - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
            if (sd < 1 || !xd[0]) {
              xd.length = 0;
              if (roundUp) {
                sd -= x.e + 1;
                xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
                x.e = -sd || 0;
              } else {
                xd[0] = x.e = 0;
              }
              return x;
            }
            if (i == 0) {
              xd.length = xdi;
              k = 1;
              xdi--;
            } else {
              xd.length = xdi + 1;
              k = mathpow(10, LOG_BASE - i);
              xd[xdi] = j > 0 ? (w / mathpow(10, digits2 - j) % mathpow(10, j) | 0) * k : 0;
            }
            if (roundUp) {
              for (; ; ) {
                if (xdi == 0) {
                  for (i = 1, j = xd[0]; j >= 10; j /= 10)
                    i++;
                  j = xd[0] += k;
                  for (k = 1; j >= 10; j /= 10)
                    k++;
                  if (i != k) {
                    x.e++;
                    if (xd[0] == BASE)
                      xd[0] = 1;
                  }
                  break;
                } else {
                  xd[xdi] += k;
                  if (xd[xdi] != BASE)
                    break;
                  xd[xdi--] = 0;
                  k = 1;
                }
              }
            }
            for (i = xd.length; xd[--i] === 0; )
              xd.pop();
          }
        if (external) {
          if (x.e > Ctor.maxE) {
            x.d = null;
            x.e = NaN;
          } else if (x.e < Ctor.minE) {
            x.e = 0;
            x.d = [0];
          }
        }
        return x;
      }
      function finiteToString(x, isExp, sd) {
        if (!x.isFinite())
          return nonFiniteToString(x);
        var k, e3 = x.e, str = digitsToString(x.d), len = str.length;
        if (isExp) {
          if (sd && (k = sd - len) > 0) {
            str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
          } else if (len > 1) {
            str = str.charAt(0) + "." + str.slice(1);
          }
          str = str + (x.e < 0 ? "e" : "e+") + x.e;
        } else if (e3 < 0) {
          str = "0." + getZeroString(-e3 - 1) + str;
          if (sd && (k = sd - len) > 0)
            str += getZeroString(k);
        } else if (e3 >= len) {
          str += getZeroString(e3 + 1 - len);
          if (sd && (k = sd - e3 - 1) > 0)
            str = str + "." + getZeroString(k);
        } else {
          if ((k = e3 + 1) < len)
            str = str.slice(0, k) + "." + str.slice(k);
          if (sd && (k = sd - len) > 0) {
            if (e3 + 1 === len)
              str += ".";
            str += getZeroString(k);
          }
        }
        return str;
      }
      function getBase10Exponent(digits2, e3) {
        var w = digits2[0];
        for (e3 *= LOG_BASE; w >= 10; w /= 10)
          e3++;
        return e3;
      }
      function getLn10(Ctor, sd, pr) {
        if (sd > LN10_PRECISION) {
          external = true;
          if (pr)
            Ctor.precision = pr;
          throw Error(precisionLimitExceeded);
        }
        return finalise(new Ctor(LN102), sd, 1, true);
      }
      function getPi(Ctor, sd, rm) {
        if (sd > PI_PRECISION)
          throw Error(precisionLimitExceeded);
        return finalise(new Ctor(PI), sd, rm, true);
      }
      function getPrecision(digits2) {
        var w = digits2.length - 1, len = w * LOG_BASE + 1;
        w = digits2[w];
        if (w) {
          for (; w % 10 == 0; w /= 10)
            len--;
          for (w = digits2[0]; w >= 10; w /= 10)
            len++;
        }
        return len;
      }
      function getZeroString(k) {
        var zs = "";
        for (; k--; )
          zs += "0";
        return zs;
      }
      function intPow(Ctor, x, n, pr) {
        var isTruncated, r = new Ctor(1), k = Math.ceil(pr / LOG_BASE + 4);
        external = false;
        for (; ; ) {
          if (n % 2) {
            r = r.times(x);
            if (truncate(r.d, k))
              isTruncated = true;
          }
          n = mathfloor(n / 2);
          if (n === 0) {
            n = r.d.length - 1;
            if (isTruncated && r.d[n] === 0)
              ++r.d[n];
            break;
          }
          x = x.times(x);
          truncate(x.d, k);
        }
        external = true;
        return r;
      }
      function isOdd(n) {
        return n.d[n.d.length - 1] & 1;
      }
      function maxOrMin(Ctor, args, ltgt) {
        var y, x = new Ctor(args[0]), i = 0;
        for (; ++i < args.length; ) {
          y = new Ctor(args[i]);
          if (!y.s) {
            x = y;
            break;
          } else if (x[ltgt](y)) {
            x = y;
          }
        }
        return x;
      }
      function naturalExponential(x, sd) {
        var denominator, guard, j, pow3, sum2, t, wpr, rep = 0, i = 0, k = 0, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
        if (!x.d || !x.d[0] || x.e > 17) {
          return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
        }
        if (sd == null) {
          external = false;
          wpr = pr;
        } else {
          wpr = sd;
        }
        t = new Ctor(0.03125);
        while (x.e > -2) {
          x = x.times(t);
          k += 5;
        }
        guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
        wpr += guard;
        denominator = pow3 = sum2 = new Ctor(1);
        Ctor.precision = wpr;
        for (; ; ) {
          pow3 = finalise(pow3.times(x), wpr, 1);
          denominator = denominator.times(++i);
          t = sum2.plus(divide(pow3, denominator, wpr, 1));
          if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
            j = k;
            while (j--)
              sum2 = finalise(sum2.times(sum2), wpr, 1);
            if (sd == null) {
              if (rep < 3 && checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
                Ctor.precision = wpr += 10;
                denominator = pow3 = t = new Ctor(1);
                i = 0;
                rep++;
              } else {
                return finalise(sum2, Ctor.precision = pr, rm, external = true);
              }
            } else {
              Ctor.precision = pr;
              return sum2;
            }
          }
          sum2 = t;
        }
      }
      function naturalLogarithm(y, sd) {
        var c, c0, denominator, e3, numerator, rep, sum2, t, wpr, x1, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
        if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
          return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
        }
        if (sd == null) {
          external = false;
          wpr = pr;
        } else {
          wpr = sd;
        }
        Ctor.precision = wpr += guard;
        c = digitsToString(xd);
        c0 = c.charAt(0);
        if (Math.abs(e3 = x.e) < 15e14) {
          while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
            x = x.times(y);
            c = digitsToString(x.d);
            c0 = c.charAt(0);
            n++;
          }
          e3 = x.e;
          if (c0 > 1) {
            x = new Ctor("0." + c);
            e3++;
          } else {
            x = new Ctor(c0 + "." + c.slice(1));
          }
        } else {
          t = getLn10(Ctor, wpr + 2, pr).times(e3 + "");
          x = naturalLogarithm(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
          Ctor.precision = pr;
          return sd == null ? finalise(x, pr, rm, external = true) : x;
        }
        x1 = x;
        sum2 = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
        x2 = finalise(x.times(x), wpr, 1);
        denominator = 3;
        for (; ; ) {
          numerator = finalise(numerator.times(x2), wpr, 1);
          t = sum2.plus(divide(numerator, new Ctor(denominator), wpr, 1));
          if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
            sum2 = sum2.times(2);
            if (e3 !== 0)
              sum2 = sum2.plus(getLn10(Ctor, wpr + 2, pr).times(e3 + ""));
            sum2 = divide(sum2, new Ctor(n), wpr, 1);
            if (sd == null) {
              if (checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
                Ctor.precision = wpr += guard;
                t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
                x2 = finalise(x.times(x), wpr, 1);
                denominator = rep = 1;
              } else {
                return finalise(sum2, Ctor.precision = pr, rm, external = true);
              }
            } else {
              Ctor.precision = pr;
              return sum2;
            }
          }
          sum2 = t;
          denominator += 2;
        }
      }
      function nonFiniteToString(x) {
        return String(x.s * x.s / 0);
      }
      function parseDecimal(x, str) {
        var e3, i, len;
        if ((e3 = str.indexOf(".")) > -1)
          str = str.replace(".", "");
        if ((i = str.search(/e/i)) > 0) {
          if (e3 < 0)
            e3 = i;
          e3 += +str.slice(i + 1);
          str = str.substring(0, i);
        } else if (e3 < 0) {
          e3 = str.length;
        }
        for (i = 0; str.charCodeAt(i) === 48; i++)
          ;
        for (len = str.length; str.charCodeAt(len - 1) === 48; --len)
          ;
        str = str.slice(i, len);
        if (str) {
          len -= i;
          x.e = e3 = e3 - i - 1;
          x.d = [];
          i = (e3 + 1) % LOG_BASE;
          if (e3 < 0)
            i += LOG_BASE;
          if (i < len) {
            if (i)
              x.d.push(+str.slice(0, i));
            for (len -= LOG_BASE; i < len; )
              x.d.push(+str.slice(i, i += LOG_BASE));
            str = str.slice(i);
            i = LOG_BASE - str.length;
          } else {
            i -= len;
          }
          for (; i--; )
            str += "0";
          x.d.push(+str);
          if (external) {
            if (x.e > x.constructor.maxE) {
              x.d = null;
              x.e = NaN;
            } else if (x.e < x.constructor.minE) {
              x.e = 0;
              x.d = [0];
            }
          }
        } else {
          x.e = 0;
          x.d = [0];
        }
        return x;
      }
      function parseOther(x, str) {
        var base, Ctor, divisor, i, isFloat, len, p, xd, xe;
        if (str === "Infinity" || str === "NaN") {
          if (!+str)
            x.s = NaN;
          x.e = NaN;
          x.d = null;
          return x;
        }
        if (isHex.test(str)) {
          base = 16;
          str = str.toLowerCase();
        } else if (isBinary.test(str)) {
          base = 2;
        } else if (isOctal.test(str)) {
          base = 8;
        } else {
          throw Error(invalidArgument + str);
        }
        i = str.search(/p/i);
        if (i > 0) {
          p = +str.slice(i + 1);
          str = str.substring(2, i);
        } else {
          str = str.slice(2);
        }
        i = str.indexOf(".");
        isFloat = i >= 0;
        Ctor = x.constructor;
        if (isFloat) {
          str = str.replace(".", "");
          len = str.length;
          i = len - i;
          divisor = intPow(Ctor, new Ctor(base), i, i * 2);
        }
        xd = convertBase(str, base, BASE);
        xe = xd.length - 1;
        for (i = xe; xd[i] === 0; --i)
          xd.pop();
        if (i < 0)
          return new Ctor(x.s * 0);
        x.e = getBase10Exponent(xd, xe);
        x.d = xd;
        external = false;
        if (isFloat)
          x = divide(x, divisor, len * 4);
        if (p)
          x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal4.pow(2, p));
        external = true;
        return x;
      }
      function sine(Ctor, x) {
        var k, len = x.d.length;
        if (len < 3)
          return taylorSeries(Ctor, 2, x, x);
        k = 1.4 * Math.sqrt(len);
        k = k > 16 ? 16 : k | 0;
        x = x.times(1 / tinyPow(5, k));
        x = taylorSeries(Ctor, 2, x, x);
        var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
        for (; k--; ) {
          sin2_x = x.times(x);
          x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
        }
        return x;
      }
      function taylorSeries(Ctor, n, x, y, isHyperbolic) {
        var j, t, u, x2, i = 1, pr = Ctor.precision, k = Math.ceil(pr / LOG_BASE);
        external = false;
        x2 = x.times(x);
        u = new Ctor(y);
        for (; ; ) {
          t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
          u = isHyperbolic ? y.plus(t) : y.minus(t);
          y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
          t = u.plus(y);
          if (t.d[k] !== void 0) {
            for (j = k; t.d[j] === u.d[j] && j--; )
              ;
            if (j == -1)
              break;
          }
          j = u;
          u = y;
          y = t;
          t = j;
          i++;
        }
        external = true;
        t.d.length = k + 1;
        return t;
      }
      function tinyPow(b, e3) {
        var n = b;
        while (--e3)
          n *= b;
        return n;
      }
      function toLessThanHalfPi(Ctor, x) {
        var t, isNeg = x.s < 0, pi3 = getPi(Ctor, Ctor.precision, 1), halfPi = pi3.times(0.5);
        x = x.abs();
        if (x.lte(halfPi)) {
          quadrant = isNeg ? 4 : 1;
          return x;
        }
        t = x.divToInt(pi3);
        if (t.isZero()) {
          quadrant = isNeg ? 3 : 2;
        } else {
          x = x.minus(t.times(pi3));
          if (x.lte(halfPi)) {
            quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
            return x;
          }
          quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
        }
        return x.minus(pi3).abs();
      }
      function toStringBinary(x, baseOut, sd, rm) {
        var base, e3, i, k, len, roundUp, str, xd, y, Ctor = x.constructor, isExp = sd !== void 0;
        if (isExp) {
          checkInt32(sd, 1, MAX_DIGITS);
          if (rm === void 0)
            rm = Ctor.rounding;
          else
            checkInt32(rm, 0, 8);
        } else {
          sd = Ctor.precision;
          rm = Ctor.rounding;
        }
        if (!x.isFinite()) {
          str = nonFiniteToString(x);
        } else {
          str = finiteToString(x);
          i = str.indexOf(".");
          if (isExp) {
            base = 2;
            if (baseOut == 16) {
              sd = sd * 4 - 3;
            } else if (baseOut == 8) {
              sd = sd * 3 - 2;
            }
          } else {
            base = baseOut;
          }
          if (i >= 0) {
            str = str.replace(".", "");
            y = new Ctor(1);
            y.e = str.length - i;
            y.d = convertBase(finiteToString(y), 10, base);
            y.e = y.d.length;
          }
          xd = convertBase(str, 10, base);
          e3 = len = xd.length;
          for (; xd[--len] == 0; )
            xd.pop();
          if (!xd[0]) {
            str = isExp ? "0p+0" : "0";
          } else {
            if (i < 0) {
              e3--;
            } else {
              x = new Ctor(x);
              x.d = xd;
              x.e = e3;
              x = divide(x, y, sd, rm, 0, base);
              xd = x.d;
              e3 = x.e;
              roundUp = inexact;
            }
            i = xd[sd];
            k = base / 2;
            roundUp = roundUp || xd[sd + 1] !== void 0;
            roundUp = rm < 4 ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2)) : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x.s < 0 ? 8 : 7));
            xd.length = sd;
            if (roundUp) {
              for (; ++xd[--sd] > base - 1; ) {
                xd[sd] = 0;
                if (!sd) {
                  ++e3;
                  xd.unshift(1);
                }
              }
            }
            for (len = xd.length; !xd[len - 1]; --len)
              ;
            for (i = 0, str = ""; i < len; i++)
              str += NUMERALS.charAt(xd[i]);
            if (isExp) {
              if (len > 1) {
                if (baseOut == 16 || baseOut == 8) {
                  i = baseOut == 16 ? 4 : 3;
                  for (--len; len % i; len++)
                    str += "0";
                  xd = convertBase(str, base, baseOut);
                  for (len = xd.length; !xd[len - 1]; --len)
                    ;
                  for (i = 1, str = "1."; i < len; i++)
                    str += NUMERALS.charAt(xd[i]);
                } else {
                  str = str.charAt(0) + "." + str.slice(1);
                }
              }
              str = str + (e3 < 0 ? "p" : "p+") + e3;
            } else if (e3 < 0) {
              for (; ++e3; )
                str = "0" + str;
              str = "0." + str;
            } else {
              if (++e3 > len)
                for (e3 -= len; e3--; )
                  str += "0";
              else if (e3 < len)
                str = str.slice(0, e3) + "." + str.slice(e3);
            }
          }
          str = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str;
        }
        return x.s < 0 ? "-" + str : str;
      }
      function truncate(arr, len) {
        if (arr.length > len) {
          arr.length = len;
          return true;
        }
      }
      function abs2(x) {
        return new this(x).abs();
      }
      function acos2(x) {
        return new this(x).acos();
      }
      function acosh3(x) {
        return new this(x).acosh();
      }
      function add2(x, y) {
        return new this(x).plus(y);
      }
      function asin2(x) {
        return new this(x).asin();
      }
      function asinh2(x) {
        return new this(x).asinh();
      }
      function atan2(x) {
        return new this(x).atan();
      }
      function atanh3(x) {
        return new this(x).atanh();
      }
      function atan22(y, x) {
        y = new this(y);
        x = new this(x);
        var r, pr = this.precision, rm = this.rounding, wpr = pr + 4;
        if (!y.s || !x.s) {
          r = new this(NaN);
        } else if (!y.d && !x.d) {
          r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
          r.s = y.s;
        } else if (!x.d || y.isZero()) {
          r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
          r.s = y.s;
        } else if (!y.d || x.isZero()) {
          r = getPi(this, wpr, 1).times(0.5);
          r.s = y.s;
        } else if (x.s < 0) {
          this.precision = wpr;
          this.rounding = 1;
          r = this.atan(divide(y, x, wpr, 1));
          x = getPi(this, wpr, 1);
          this.precision = pr;
          this.rounding = rm;
          r = y.s < 0 ? r.minus(x) : r.plus(x);
        } else {
          r = this.atan(divide(y, x, wpr, 1));
        }
        return r;
      }
      function cbrt4(x) {
        return new this(x).cbrt();
      }
      function ceil2(x) {
        return finalise(x = new this(x), x.e + 1, 2);
      }
      function config5(obj) {
        if (!obj || typeof obj !== "object")
          throw Error(decimalError + "Object expected");
        var i, p, v, useDefaults = obj.defaults === true, ps = [
          "precision",
          1,
          MAX_DIGITS,
          "rounding",
          0,
          8,
          "toExpNeg",
          -EXP_LIMIT,
          0,
          "toExpPos",
          0,
          EXP_LIMIT,
          "maxE",
          0,
          EXP_LIMIT,
          "minE",
          -EXP_LIMIT,
          0,
          "modulo",
          0,
          9
        ];
        for (i = 0; i < ps.length; i += 3) {
          if (p = ps[i], useDefaults)
            this[p] = DEFAULTS[p];
          if ((v = obj[p]) !== void 0) {
            if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2])
              this[p] = v;
            else
              throw Error(invalidArgument + p + ": " + v);
          }
        }
        if (p = "crypto", useDefaults)
          this[p] = DEFAULTS[p];
        if ((v = obj[p]) !== void 0) {
          if (v === true || v === false || v === 0 || v === 1) {
            if (v) {
              if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                this[p] = true;
              } else {
                throw Error(cryptoUnavailable);
              }
            } else {
              this[p] = false;
            }
          } else {
            throw Error(invalidArgument + p + ": " + v);
          }
        }
        return this;
      }
      function cos2(x) {
        return new this(x).cos();
      }
      function cosh2(x) {
        return new this(x).cosh();
      }
      function clone2(obj) {
        var i, p, ps;
        function Decimal5(v) {
          var e3, i2, t, x = this;
          if (!(x instanceof Decimal5))
            return new Decimal5(v);
          x.constructor = Decimal5;
          if (v instanceof Decimal5) {
            x.s = v.s;
            if (external) {
              if (!v.d || v.e > Decimal5.maxE) {
                x.e = NaN;
                x.d = null;
              } else if (v.e < Decimal5.minE) {
                x.e = 0;
                x.d = [0];
              } else {
                x.e = v.e;
                x.d = v.d.slice();
              }
            } else {
              x.e = v.e;
              x.d = v.d ? v.d.slice() : v.d;
            }
            return;
          }
          t = typeof v;
          if (t === "number") {
            if (v === 0) {
              x.s = 1 / v < 0 ? -1 : 1;
              x.e = 0;
              x.d = [0];
              return;
            }
            if (v < 0) {
              v = -v;
              x.s = -1;
            } else {
              x.s = 1;
            }
            if (v === ~~v && v < 1e7) {
              for (e3 = 0, i2 = v; i2 >= 10; i2 /= 10)
                e3++;
              if (external) {
                if (e3 > Decimal5.maxE) {
                  x.e = NaN;
                  x.d = null;
                } else if (e3 < Decimal5.minE) {
                  x.e = 0;
                  x.d = [0];
                } else {
                  x.e = e3;
                  x.d = [v];
                }
              } else {
                x.e = e3;
                x.d = [v];
              }
              return;
            } else if (v * 0 !== 0) {
              if (!v)
                x.s = NaN;
              x.e = NaN;
              x.d = null;
              return;
            }
            return parseDecimal(x, v.toString());
          } else if (t !== "string") {
            throw Error(invalidArgument + v);
          }
          if ((i2 = v.charCodeAt(0)) === 45) {
            v = v.slice(1);
            x.s = -1;
          } else {
            if (i2 === 43)
              v = v.slice(1);
            x.s = 1;
          }
          return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
        }
        Decimal5.prototype = P;
        Decimal5.ROUND_UP = 0;
        Decimal5.ROUND_DOWN = 1;
        Decimal5.ROUND_CEIL = 2;
        Decimal5.ROUND_FLOOR = 3;
        Decimal5.ROUND_HALF_UP = 4;
        Decimal5.ROUND_HALF_DOWN = 5;
        Decimal5.ROUND_HALF_EVEN = 6;
        Decimal5.ROUND_HALF_CEIL = 7;
        Decimal5.ROUND_HALF_FLOOR = 8;
        Decimal5.EUCLID = 9;
        Decimal5.config = Decimal5.set = config5;
        Decimal5.clone = clone2;
        Decimal5.isDecimal = isDecimalInstance;
        Decimal5.abs = abs2;
        Decimal5.acos = acos2;
        Decimal5.acosh = acosh3;
        Decimal5.add = add2;
        Decimal5.asin = asin2;
        Decimal5.asinh = asinh2;
        Decimal5.atan = atan2;
        Decimal5.atanh = atanh3;
        Decimal5.atan2 = atan22;
        Decimal5.cbrt = cbrt4;
        Decimal5.ceil = ceil2;
        Decimal5.cos = cos2;
        Decimal5.cosh = cosh2;
        Decimal5.div = div;
        Decimal5.exp = exp;
        Decimal5.floor = floor2;
        Decimal5.hypot = hypot;
        Decimal5.ln = ln;
        Decimal5.log = log3;
        Decimal5.log10 = log104;
        Decimal5.log2 = log24;
        Decimal5.max = max2;
        Decimal5.min = min2;
        Decimal5.mod = mod;
        Decimal5.mul = mul;
        Decimal5.pow = pow2;
        Decimal5.random = random2;
        Decimal5.round = round2;
        Decimal5.sign = sign2;
        Decimal5.sin = sin2;
        Decimal5.sinh = sinh2;
        Decimal5.sqrt = sqrt2;
        Decimal5.sub = sub;
        Decimal5.tan = tan;
        Decimal5.tanh = tanh2;
        Decimal5.trunc = trunc;
        if (obj === void 0)
          obj = {};
        if (obj) {
          if (obj.defaults !== true) {
            ps = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
            for (i = 0; i < ps.length; )
              if (!obj.hasOwnProperty(p = ps[i++]))
                obj[p] = this[p];
          }
        }
        Decimal5.config(obj);
        return Decimal5;
      }
      function div(x, y) {
        return new this(x).div(y);
      }
      function exp(x) {
        return new this(x).exp();
      }
      function floor2(x) {
        return finalise(x = new this(x), x.e + 1, 3);
      }
      function hypot() {
        var i, n, t = new this(0);
        external = false;
        for (i = 0; i < arguments.length; ) {
          n = new this(arguments[i++]);
          if (!n.d) {
            if (n.s) {
              external = true;
              return new this(1 / 0);
            }
            t = n;
          } else if (t.d) {
            t = t.plus(n.times(n));
          }
        }
        external = true;
        return t.sqrt();
      }
      function isDecimalInstance(obj) {
        return obj instanceof Decimal4 || obj && obj.name === "[object Decimal]" || false;
      }
      function ln(x) {
        return new this(x).ln();
      }
      function log3(x, y) {
        return new this(x).log(y);
      }
      function log24(x) {
        return new this(x).log(2);
      }
      function log104(x) {
        return new this(x).log(10);
      }
      function max2() {
        return maxOrMin(this, arguments, "lt");
      }
      function min2() {
        return maxOrMin(this, arguments, "gt");
      }
      function mod(x, y) {
        return new this(x).mod(y);
      }
      function mul(x, y) {
        return new this(x).mul(y);
      }
      function pow2(x, y) {
        return new this(x).pow(y);
      }
      function random2(sd) {
        var d, e3, k, n, i = 0, r = new this(1), rd = [];
        if (sd === void 0)
          sd = this.precision;
        else
          checkInt32(sd, 1, MAX_DIGITS);
        k = Math.ceil(sd / LOG_BASE);
        if (!this.crypto) {
          for (; i < k; )
            rd[i++] = Math.random() * 1e7 | 0;
        } else if (crypto.getRandomValues) {
          d = crypto.getRandomValues(new Uint32Array(k));
          for (; i < k; ) {
            n = d[i];
            if (n >= 429e7) {
              d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
            } else {
              rd[i++] = n % 1e7;
            }
          }
        } else if (crypto.randomBytes) {
          d = crypto.randomBytes(k *= 4);
          for (; i < k; ) {
            n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 127) << 24);
            if (n >= 214e7) {
              crypto.randomBytes(4).copy(d, i);
            } else {
              rd.push(n % 1e7);
              i += 4;
            }
          }
          i = k / 4;
        } else {
          throw Error(cryptoUnavailable);
        }
        k = rd[--i];
        sd %= LOG_BASE;
        if (k && sd) {
          n = mathpow(10, LOG_BASE - sd);
          rd[i] = (k / n | 0) * n;
        }
        for (; rd[i] === 0; i--)
          rd.pop();
        if (i < 0) {
          e3 = 0;
          rd = [0];
        } else {
          e3 = -1;
          for (; rd[0] === 0; e3 -= LOG_BASE)
            rd.shift();
          for (k = 1, n = rd[0]; n >= 10; n /= 10)
            k++;
          if (k < LOG_BASE)
            e3 -= LOG_BASE - k;
        }
        r.e = e3;
        r.d = rd;
        return r;
      }
      function round2(x) {
        return finalise(x = new this(x), x.e + 1, this.rounding);
      }
      function sign2(x) {
        x = new this(x);
        return x.d ? x.d[0] ? x.s : 0 * x.s : x.s || NaN;
      }
      function sin2(x) {
        return new this(x).sin();
      }
      function sinh2(x) {
        return new this(x).sinh();
      }
      function sqrt2(x) {
        return new this(x).sqrt();
      }
      function sub(x, y) {
        return new this(x).sub(y);
      }
      function tan(x) {
        return new this(x).tan();
      }
      function tanh2(x) {
        return new this(x).tanh();
      }
      function trunc(x) {
        return finalise(x = new this(x), x.e + 1, 1);
      }
      Decimal4 = clone2(DEFAULTS);
      Decimal4["default"] = Decimal4.Decimal = Decimal4;
      LN102 = new Decimal4(LN102);
      PI = new Decimal4(PI);
      if (typeof define == "function" && define.amd) {
        define(function() {
          return Decimal4;
        });
      } else if (typeof module != "undefined" && module.exports) {
        if (typeof Symbol == "function" && typeof Symbol.iterator == "symbol") {
          P[Symbol.for("nodejs.util.inspect.custom")] = P.toString;
          P[Symbol.toStringTag] = "Decimal";
        }
        module.exports = Decimal4;
      } else {
        if (!globalScope) {
          globalScope = typeof self != "undefined" && self && self.self == self ? self : window;
        }
        noConflict = globalScope.Decimal;
        Decimal4.noConflict = function() {
          globalScope.Decimal = noConflict;
          return Decimal4;
        };
        globalScope.Decimal = Decimal4;
      }
    })(exports);
  });

  // node_modules/complex.js/complex.js
  var require_complex = __commonJS((exports, module) => {
    /**
     * @license Complex.js v2.0.11 11/02/2016
     *
     * Copyright (c) 2016, Robert Eisele (robert@xarg.org)
     * Dual licensed under the MIT or GPL Version 2 licenses.
     **/
    (function(root) {
      "use strict";
      var cosh2 = function(x) {
        return (Math.exp(x) + Math.exp(-x)) * 0.5;
      };
      var sinh2 = function(x) {
        return (Math.exp(x) - Math.exp(-x)) * 0.5;
      };
      var cosm1 = function(x) {
        var limit = Math.PI / 4;
        if (x < -limit || x > limit) {
          return Math.cos(x) - 1;
        }
        var xx = x * x;
        return xx * (-0.5 + xx * (1 / 24 + xx * (-1 / 720 + xx * (1 / 40320 + xx * (-1 / 3628800 + xx * (1 / 4790014600 + xx * (-1 / 87178291200 + xx * (1 / 20922789888e3))))))));
      };
      var hypot = function(x, y) {
        var a = Math.abs(x);
        var b = Math.abs(y);
        if (a < 3e3 && b < 3e3) {
          return Math.sqrt(a * a + b * b);
        }
        if (a < b) {
          a = b;
          b = x / y;
        } else {
          b = y / x;
        }
        return a * Math.sqrt(1 + b * b);
      };
      var parser_exit = function() {
        throw SyntaxError("Invalid Param");
      };
      function logHypot(a, b) {
        var _a = Math.abs(a);
        var _b = Math.abs(b);
        if (a === 0) {
          return Math.log(_b);
        }
        if (b === 0) {
          return Math.log(_a);
        }
        if (_a < 3e3 && _b < 3e3) {
          return Math.log(a * a + b * b) * 0.5;
        }
        return Math.log(a / Math.cos(Math.atan2(b, a)));
      }
      var parse = function(a, b) {
        var z = {re: 0, im: 0};
        if (a === void 0 || a === null) {
          z["re"] = z["im"] = 0;
        } else if (b !== void 0) {
          z["re"] = a;
          z["im"] = b;
        } else
          switch (typeof a) {
            case "object":
              if ("im" in a && "re" in a) {
                z["re"] = a["re"];
                z["im"] = a["im"];
              } else if ("abs" in a && "arg" in a) {
                if (!Number.isFinite(a["abs"]) && Number.isFinite(a["arg"])) {
                  return Complex3["INFINITY"];
                }
                z["re"] = a["abs"] * Math.cos(a["arg"]);
                z["im"] = a["abs"] * Math.sin(a["arg"]);
              } else if ("r" in a && "phi" in a) {
                if (!Number.isFinite(a["r"]) && Number.isFinite(a["phi"])) {
                  return Complex3["INFINITY"];
                }
                z["re"] = a["r"] * Math.cos(a["phi"]);
                z["im"] = a["r"] * Math.sin(a["phi"]);
              } else if (a.length === 2) {
                z["re"] = a[0];
                z["im"] = a[1];
              } else {
                parser_exit();
              }
              break;
            case "string":
              z["im"] = z["re"] = 0;
              var tokens = a.match(/\d+\.?\d*e[+-]?\d+|\d+\.?\d*|\.\d+|./g);
              var plus = 1;
              var minus = 0;
              if (tokens === null) {
                parser_exit();
              }
              for (var i = 0; i < tokens.length; i++) {
                var c = tokens[i];
                if (c === " " || c === "	" || c === "\n") {
                } else if (c === "+") {
                  plus++;
                } else if (c === "-") {
                  minus++;
                } else if (c === "i" || c === "I") {
                  if (plus + minus === 0) {
                    parser_exit();
                  }
                  if (tokens[i + 1] !== " " && !isNaN(tokens[i + 1])) {
                    z["im"] += parseFloat((minus % 2 ? "-" : "") + tokens[i + 1]);
                    i++;
                  } else {
                    z["im"] += parseFloat((minus % 2 ? "-" : "") + "1");
                  }
                  plus = minus = 0;
                } else {
                  if (plus + minus === 0 || isNaN(c)) {
                    parser_exit();
                  }
                  if (tokens[i + 1] === "i" || tokens[i + 1] === "I") {
                    z["im"] += parseFloat((minus % 2 ? "-" : "") + c);
                    i++;
                  } else {
                    z["re"] += parseFloat((minus % 2 ? "-" : "") + c);
                  }
                  plus = minus = 0;
                }
              }
              if (plus + minus > 0) {
                parser_exit();
              }
              break;
            case "number":
              z["im"] = 0;
              z["re"] = a;
              break;
            default:
              parser_exit();
          }
        if (isNaN(z["re"]) || isNaN(z["im"])) {
        }
        return z;
      };
      function Complex3(a, b) {
        if (!(this instanceof Complex3)) {
          return new Complex3(a, b);
        }
        var z = parse(a, b);
        this["re"] = z["re"];
        this["im"] = z["im"];
      }
      Complex3.prototype = {
        re: 0,
        im: 0,
        sign: function() {
          var abs2 = this["abs"]();
          return new Complex3(this["re"] / abs2, this["im"] / abs2);
        },
        add: function(a, b) {
          var z = new Complex3(a, b);
          if (this["isInfinite"]() && z["isInfinite"]()) {
            return Complex3["NAN"];
          }
          if (this["isInfinite"]() || z["isInfinite"]()) {
            return Complex3["INFINITY"];
          }
          return new Complex3(this["re"] + z["re"], this["im"] + z["im"]);
        },
        sub: function(a, b) {
          var z = new Complex3(a, b);
          if (this["isInfinite"]() && z["isInfinite"]()) {
            return Complex3["NAN"];
          }
          if (this["isInfinite"]() || z["isInfinite"]()) {
            return Complex3["INFINITY"];
          }
          return new Complex3(this["re"] - z["re"], this["im"] - z["im"]);
        },
        mul: function(a, b) {
          var z = new Complex3(a, b);
          if (this["isInfinite"]() && z["isZero"]() || this["isZero"]() && z["isInfinite"]()) {
            return Complex3["NAN"];
          }
          if (this["isInfinite"]() || z["isInfinite"]()) {
            return Complex3["INFINITY"];
          }
          if (z["im"] === 0 && this["im"] === 0) {
            return new Complex3(this["re"] * z["re"], 0);
          }
          return new Complex3(this["re"] * z["re"] - this["im"] * z["im"], this["re"] * z["im"] + this["im"] * z["re"]);
        },
        div: function(a, b) {
          var z = new Complex3(a, b);
          if (this["isZero"]() && z["isZero"]() || this["isInfinite"]() && z["isInfinite"]()) {
            return Complex3["NAN"];
          }
          if (this["isInfinite"]() || z["isZero"]()) {
            return Complex3["INFINITY"];
          }
          if (this["isZero"]() || z["isInfinite"]()) {
            return Complex3["ZERO"];
          }
          a = this["re"];
          b = this["im"];
          var c = z["re"];
          var d = z["im"];
          var t, x;
          if (d === 0) {
            return new Complex3(a / c, b / c);
          }
          if (Math.abs(c) < Math.abs(d)) {
            x = c / d;
            t = c * x + d;
            return new Complex3((a * x + b) / t, (b * x - a) / t);
          } else {
            x = d / c;
            t = d * x + c;
            return new Complex3((a + b * x) / t, (b - a * x) / t);
          }
        },
        pow: function(a, b) {
          var z = new Complex3(a, b);
          a = this["re"];
          b = this["im"];
          if (z["isZero"]()) {
            return Complex3["ONE"];
          }
          if (z["im"] === 0) {
            if (b === 0 && a >= 0) {
              return new Complex3(Math.pow(a, z["re"]), 0);
            } else if (a === 0) {
              switch ((z["re"] % 4 + 4) % 4) {
                case 0:
                  return new Complex3(Math.pow(b, z["re"]), 0);
                case 1:
                  return new Complex3(0, Math.pow(b, z["re"]));
                case 2:
                  return new Complex3(-Math.pow(b, z["re"]), 0);
                case 3:
                  return new Complex3(0, -Math.pow(b, z["re"]));
              }
            }
          }
          if (a === 0 && b === 0 && z["re"] > 0 && z["im"] >= 0) {
            return Complex3["ZERO"];
          }
          var arg = Math.atan2(b, a);
          var loh = logHypot(a, b);
          a = Math.exp(z["re"] * loh - z["im"] * arg);
          b = z["im"] * loh + z["re"] * arg;
          return new Complex3(a * Math.cos(b), a * Math.sin(b));
        },
        sqrt: function() {
          var a = this["re"];
          var b = this["im"];
          var r = this["abs"]();
          var re, im;
          if (a >= 0) {
            if (b === 0) {
              return new Complex3(Math.sqrt(a), 0);
            }
            re = 0.5 * Math.sqrt(2 * (r + a));
          } else {
            re = Math.abs(b) / Math.sqrt(2 * (r - a));
          }
          if (a <= 0) {
            im = 0.5 * Math.sqrt(2 * (r - a));
          } else {
            im = Math.abs(b) / Math.sqrt(2 * (r + a));
          }
          return new Complex3(re, b < 0 ? -im : im);
        },
        exp: function() {
          var tmp = Math.exp(this["re"]);
          if (this["im"] === 0) {
          }
          return new Complex3(tmp * Math.cos(this["im"]), tmp * Math.sin(this["im"]));
        },
        expm1: function() {
          var a = this["re"];
          var b = this["im"];
          return new Complex3(Math.expm1(a) * Math.cos(b) + cosm1(b), Math.exp(a) * Math.sin(b));
        },
        log: function() {
          var a = this["re"];
          var b = this["im"];
          if (b === 0 && a > 0) {
          }
          return new Complex3(logHypot(a, b), Math.atan2(b, a));
        },
        abs: function() {
          return hypot(this["re"], this["im"]);
        },
        arg: function() {
          return Math.atan2(this["im"], this["re"]);
        },
        sin: function() {
          var a = this["re"];
          var b = this["im"];
          return new Complex3(Math.sin(a) * cosh2(b), Math.cos(a) * sinh2(b));
        },
        cos: function() {
          var a = this["re"];
          var b = this["im"];
          return new Complex3(Math.cos(a) * cosh2(b), -Math.sin(a) * sinh2(b));
        },
        tan: function() {
          var a = 2 * this["re"];
          var b = 2 * this["im"];
          var d = Math.cos(a) + cosh2(b);
          return new Complex3(Math.sin(a) / d, sinh2(b) / d);
        },
        cot: function() {
          var a = 2 * this["re"];
          var b = 2 * this["im"];
          var d = Math.cos(a) - cosh2(b);
          return new Complex3(-Math.sin(a) / d, sinh2(b) / d);
        },
        sec: function() {
          var a = this["re"];
          var b = this["im"];
          var d = 0.5 * cosh2(2 * b) + 0.5 * Math.cos(2 * a);
          return new Complex3(Math.cos(a) * cosh2(b) / d, Math.sin(a) * sinh2(b) / d);
        },
        csc: function() {
          var a = this["re"];
          var b = this["im"];
          var d = 0.5 * cosh2(2 * b) - 0.5 * Math.cos(2 * a);
          return new Complex3(Math.sin(a) * cosh2(b) / d, -Math.cos(a) * sinh2(b) / d);
        },
        asin: function() {
          var a = this["re"];
          var b = this["im"];
          var t1 = new Complex3(b * b - a * a + 1, -2 * a * b)["sqrt"]();
          var t2 = new Complex3(t1["re"] - b, t1["im"] + a)["log"]();
          return new Complex3(t2["im"], -t2["re"]);
        },
        acos: function() {
          var a = this["re"];
          var b = this["im"];
          var t1 = new Complex3(b * b - a * a + 1, -2 * a * b)["sqrt"]();
          var t2 = new Complex3(t1["re"] - b, t1["im"] + a)["log"]();
          return new Complex3(Math.PI / 2 - t2["im"], t2["re"]);
        },
        atan: function() {
          var a = this["re"];
          var b = this["im"];
          if (a === 0) {
            if (b === 1) {
              return new Complex3(0, Infinity);
            }
            if (b === -1) {
              return new Complex3(0, -Infinity);
            }
          }
          var d = a * a + (1 - b) * (1 - b);
          var t1 = new Complex3((1 - b * b - a * a) / d, -2 * a / d).log();
          return new Complex3(-0.5 * t1["im"], 0.5 * t1["re"]);
        },
        acot: function() {
          var a = this["re"];
          var b = this["im"];
          if (b === 0) {
            return new Complex3(Math.atan2(1, a), 0);
          }
          var d = a * a + b * b;
          return d !== 0 ? new Complex3(a / d, -b / d).atan() : new Complex3(a !== 0 ? a / 0 : 0, b !== 0 ? -b / 0 : 0).atan();
        },
        asec: function() {
          var a = this["re"];
          var b = this["im"];
          if (a === 0 && b === 0) {
            return new Complex3(0, Infinity);
          }
          var d = a * a + b * b;
          return d !== 0 ? new Complex3(a / d, -b / d).acos() : new Complex3(a !== 0 ? a / 0 : 0, b !== 0 ? -b / 0 : 0).acos();
        },
        acsc: function() {
          var a = this["re"];
          var b = this["im"];
          if (a === 0 && b === 0) {
            return new Complex3(Math.PI / 2, Infinity);
          }
          var d = a * a + b * b;
          return d !== 0 ? new Complex3(a / d, -b / d).asin() : new Complex3(a !== 0 ? a / 0 : 0, b !== 0 ? -b / 0 : 0).asin();
        },
        sinh: function() {
          var a = this["re"];
          var b = this["im"];
          return new Complex3(sinh2(a) * Math.cos(b), cosh2(a) * Math.sin(b));
        },
        cosh: function() {
          var a = this["re"];
          var b = this["im"];
          return new Complex3(cosh2(a) * Math.cos(b), sinh2(a) * Math.sin(b));
        },
        tanh: function() {
          var a = 2 * this["re"];
          var b = 2 * this["im"];
          var d = cosh2(a) + Math.cos(b);
          return new Complex3(sinh2(a) / d, Math.sin(b) / d);
        },
        coth: function() {
          var a = 2 * this["re"];
          var b = 2 * this["im"];
          var d = cosh2(a) - Math.cos(b);
          return new Complex3(sinh2(a) / d, -Math.sin(b) / d);
        },
        csch: function() {
          var a = this["re"];
          var b = this["im"];
          var d = Math.cos(2 * b) - cosh2(2 * a);
          return new Complex3(-2 * sinh2(a) * Math.cos(b) / d, 2 * cosh2(a) * Math.sin(b) / d);
        },
        sech: function() {
          var a = this["re"];
          var b = this["im"];
          var d = Math.cos(2 * b) + cosh2(2 * a);
          return new Complex3(2 * cosh2(a) * Math.cos(b) / d, -2 * sinh2(a) * Math.sin(b) / d);
        },
        asinh: function() {
          var tmp = this["im"];
          this["im"] = -this["re"];
          this["re"] = tmp;
          var res = this["asin"]();
          this["re"] = -this["im"];
          this["im"] = tmp;
          tmp = res["re"];
          res["re"] = -res["im"];
          res["im"] = tmp;
          return res;
        },
        acosh: function() {
          var res = this["acos"]();
          if (res["im"] <= 0) {
            var tmp = res["re"];
            res["re"] = -res["im"];
            res["im"] = tmp;
          } else {
            var tmp = res["im"];
            res["im"] = -res["re"];
            res["re"] = tmp;
          }
          return res;
        },
        atanh: function() {
          var a = this["re"];
          var b = this["im"];
          var noIM = a > 1 && b === 0;
          var oneMinus = 1 - a;
          var onePlus = 1 + a;
          var d = oneMinus * oneMinus + b * b;
          var x = d !== 0 ? new Complex3((onePlus * oneMinus - b * b) / d, (b * oneMinus + onePlus * b) / d) : new Complex3(a !== -1 ? a / 0 : 0, b !== 0 ? b / 0 : 0);
          var temp = x["re"];
          x["re"] = logHypot(x["re"], x["im"]) / 2;
          x["im"] = Math.atan2(x["im"], temp) / 2;
          if (noIM) {
            x["im"] = -x["im"];
          }
          return x;
        },
        acoth: function() {
          var a = this["re"];
          var b = this["im"];
          if (a === 0 && b === 0) {
            return new Complex3(0, Math.PI / 2);
          }
          var d = a * a + b * b;
          return d !== 0 ? new Complex3(a / d, -b / d).atanh() : new Complex3(a !== 0 ? a / 0 : 0, b !== 0 ? -b / 0 : 0).atanh();
        },
        acsch: function() {
          var a = this["re"];
          var b = this["im"];
          if (b === 0) {
            return new Complex3(a !== 0 ? Math.log(a + Math.sqrt(a * a + 1)) : Infinity, 0);
          }
          var d = a * a + b * b;
          return d !== 0 ? new Complex3(a / d, -b / d).asinh() : new Complex3(a !== 0 ? a / 0 : 0, b !== 0 ? -b / 0 : 0).asinh();
        },
        asech: function() {
          var a = this["re"];
          var b = this["im"];
          if (this["isZero"]()) {
            return Complex3["INFINITY"];
          }
          var d = a * a + b * b;
          return d !== 0 ? new Complex3(a / d, -b / d).acosh() : new Complex3(a !== 0 ? a / 0 : 0, b !== 0 ? -b / 0 : 0).acosh();
        },
        inverse: function() {
          if (this["isZero"]()) {
            return Complex3["INFINITY"];
          }
          if (this["isInfinite"]()) {
            return Complex3["ZERO"];
          }
          var a = this["re"];
          var b = this["im"];
          var d = a * a + b * b;
          return new Complex3(a / d, -b / d);
        },
        conjugate: function() {
          return new Complex3(this["re"], -this["im"]);
        },
        neg: function() {
          return new Complex3(-this["re"], -this["im"]);
        },
        ceil: function(places) {
          places = Math.pow(10, places || 0);
          return new Complex3(Math.ceil(this["re"] * places) / places, Math.ceil(this["im"] * places) / places);
        },
        floor: function(places) {
          places = Math.pow(10, places || 0);
          return new Complex3(Math.floor(this["re"] * places) / places, Math.floor(this["im"] * places) / places);
        },
        round: function(places) {
          places = Math.pow(10, places || 0);
          return new Complex3(Math.round(this["re"] * places) / places, Math.round(this["im"] * places) / places);
        },
        equals: function(a, b) {
          var z = new Complex3(a, b);
          return Math.abs(z["re"] - this["re"]) <= Complex3["EPSILON"] && Math.abs(z["im"] - this["im"]) <= Complex3["EPSILON"];
        },
        clone: function() {
          return new Complex3(this["re"], this["im"]);
        },
        toString: function() {
          var a = this["re"];
          var b = this["im"];
          var ret = "";
          if (this["isNaN"]()) {
            return "NaN";
          }
          if (this["isZero"]()) {
            return "0";
          }
          if (this["isInfinite"]()) {
            return "Infinity";
          }
          if (a !== 0) {
            ret += a;
          }
          if (b !== 0) {
            if (a !== 0) {
              ret += b < 0 ? " - " : " + ";
            } else if (b < 0) {
              ret += "-";
            }
            b = Math.abs(b);
            if (b !== 1) {
              ret += b;
            }
            ret += "i";
          }
          if (!ret)
            return "0";
          return ret;
        },
        toVector: function() {
          return [this["re"], this["im"]];
        },
        valueOf: function() {
          if (this["im"] === 0) {
            return this["re"];
          }
          return null;
        },
        isNaN: function() {
          return isNaN(this["re"]) || isNaN(this["im"]);
        },
        isZero: function() {
          return (this["re"] === 0 || this["re"] === -0) && (this["im"] === 0 || this["im"] === -0);
        },
        isFinite: function() {
          return isFinite(this["re"]) && isFinite(this["im"]);
        },
        isInfinite: function() {
          return !(this["isNaN"]() || this["isFinite"]());
        }
      };
      Complex3["ZERO"] = new Complex3(0, 0);
      Complex3["ONE"] = new Complex3(1, 0);
      Complex3["I"] = new Complex3(0, 1);
      Complex3["PI"] = new Complex3(Math.PI, 0);
      Complex3["E"] = new Complex3(Math.E, 0);
      Complex3["INFINITY"] = new Complex3(Infinity, Infinity);
      Complex3["NAN"] = new Complex3(NaN, NaN);
      Complex3["EPSILON"] = 1e-16;
      if (typeof define === "function" && define["amd"]) {
        define([], function() {
          return Complex3;
        });
      } else if (typeof exports === "object") {
        Object.defineProperty(exports, "__esModule", {value: true});
        Complex3["default"] = Complex3;
        Complex3["Complex"] = Complex3;
        module["exports"] = Complex3;
      } else {
        root["Complex"] = Complex3;
      }
    })(exports);
  });

  // node_modules/fraction.js/fraction.js
  var require_fraction = __commonJS((exports, module) => {
    /**
     * @license Fraction.js v4.0.12 09/09/2015
     * http://www.xarg.org/2014/03/rational-numbers-in-javascript/
     *
     * Copyright (c) 2015, Robert Eisele (robert@xarg.org)
     * Dual licensed under the MIT or GPL Version 2 licenses.
     **/
    (function(root) {
      "use strict";
      var MAX_CYCLE_LEN = 2e3;
      var P = {
        s: 1,
        n: 0,
        d: 1
      };
      function createError(name94) {
        function errorConstructor() {
          var temp = Error.apply(this, arguments);
          temp["name"] = this["name"] = name94;
          this["stack"] = temp["stack"];
          this["message"] = temp["message"];
        }
        function IntermediateInheritor() {
        }
        IntermediateInheritor.prototype = Error.prototype;
        errorConstructor.prototype = new IntermediateInheritor();
        return errorConstructor;
      }
      var DivisionByZero = Fraction3["DivisionByZero"] = createError("DivisionByZero");
      var InvalidParameter = Fraction3["InvalidParameter"] = createError("InvalidParameter");
      function assign(n, s) {
        if (isNaN(n = parseInt(n, 10))) {
          throwInvalidParam();
        }
        return n * s;
      }
      function throwInvalidParam() {
        throw new InvalidParameter();
      }
      var parse = function(p1, p2) {
        var n = 0, d = 1, s = 1;
        var v = 0, w = 0, x = 0, y = 1, z = 1;
        var A = 0, B = 1;
        var C = 1, D = 1;
        var N = 1e7;
        var M;
        if (p1 === void 0 || p1 === null) {
        } else if (p2 !== void 0) {
          n = p1;
          d = p2;
          s = n * d;
        } else
          switch (typeof p1) {
            case "object": {
              if ("d" in p1 && "n" in p1) {
                n = p1["n"];
                d = p1["d"];
                if ("s" in p1)
                  n *= p1["s"];
              } else if (0 in p1) {
                n = p1[0];
                if (1 in p1)
                  d = p1[1];
              } else {
                throwInvalidParam();
              }
              s = n * d;
              break;
            }
            case "number": {
              if (p1 < 0) {
                s = p1;
                p1 = -p1;
              }
              if (p1 % 1 === 0) {
                n = p1;
              } else if (p1 > 0) {
                if (p1 >= 1) {
                  z = Math.pow(10, Math.floor(1 + Math.log(p1) / Math.LN10));
                  p1 /= z;
                }
                while (B <= N && D <= N) {
                  M = (A + C) / (B + D);
                  if (p1 === M) {
                    if (B + D <= N) {
                      n = A + C;
                      d = B + D;
                    } else if (D > B) {
                      n = C;
                      d = D;
                    } else {
                      n = A;
                      d = B;
                    }
                    break;
                  } else {
                    if (p1 > M) {
                      A += C;
                      B += D;
                    } else {
                      C += A;
                      D += B;
                    }
                    if (B > N) {
                      n = C;
                      d = D;
                    } else {
                      n = A;
                      d = B;
                    }
                  }
                }
                n *= z;
              } else if (isNaN(p1) || isNaN(p2)) {
                d = n = NaN;
              }
              break;
            }
            case "string": {
              B = p1.match(/\d+|./g);
              if (B === null)
                throwInvalidParam();
              if (B[A] === "-") {
                s = -1;
                A++;
              } else if (B[A] === "+") {
                A++;
              }
              if (B.length === A + 1) {
                w = assign(B[A++], s);
              } else if (B[A + 1] === "." || B[A] === ".") {
                if (B[A] !== ".") {
                  v = assign(B[A++], s);
                }
                A++;
                if (A + 1 === B.length || B[A + 1] === "(" && B[A + 3] === ")" || B[A + 1] === "'" && B[A + 3] === "'") {
                  w = assign(B[A], s);
                  y = Math.pow(10, B[A].length);
                  A++;
                }
                if (B[A] === "(" && B[A + 2] === ")" || B[A] === "'" && B[A + 2] === "'") {
                  x = assign(B[A + 1], s);
                  z = Math.pow(10, B[A + 1].length) - 1;
                  A += 3;
                }
              } else if (B[A + 1] === "/" || B[A + 1] === ":") {
                w = assign(B[A], s);
                y = assign(B[A + 2], 1);
                A += 3;
              } else if (B[A + 3] === "/" && B[A + 1] === " ") {
                v = assign(B[A], s);
                w = assign(B[A + 2], s);
                y = assign(B[A + 4], 1);
                A += 5;
              }
              if (B.length <= A) {
                d = y * z;
                s = n = x + d * v + z * w;
                break;
              }
            }
            default:
              throwInvalidParam();
          }
        if (d === 0) {
          throw new DivisionByZero();
        }
        P["s"] = s < 0 ? -1 : 1;
        P["n"] = Math.abs(n);
        P["d"] = Math.abs(d);
      };
      function modpow(b, e3, m) {
        var r = 1;
        for (; e3 > 0; b = b * b % m, e3 >>= 1) {
          if (e3 & 1) {
            r = r * b % m;
          }
        }
        return r;
      }
      function cycleLen(n, d) {
        for (; d % 2 === 0; d /= 2) {
        }
        for (; d % 5 === 0; d /= 5) {
        }
        if (d === 1)
          return 0;
        var rem = 10 % d;
        var t = 1;
        for (; rem !== 1; t++) {
          rem = rem * 10 % d;
          if (t > MAX_CYCLE_LEN)
            return 0;
        }
        return t;
      }
      function cycleStart(n, d, len) {
        var rem1 = 1;
        var rem2 = modpow(10, len, d);
        for (var t = 0; t < 300; t++) {
          if (rem1 === rem2)
            return t;
          rem1 = rem1 * 10 % d;
          rem2 = rem2 * 10 % d;
        }
        return 0;
      }
      function gcd(a, b) {
        if (!a)
          return b;
        if (!b)
          return a;
        while (1) {
          a %= b;
          if (!a)
            return b;
          b %= a;
          if (!b)
            return a;
        }
      }
      ;
      function Fraction3(a, b) {
        if (!(this instanceof Fraction3)) {
          return new Fraction3(a, b);
        }
        parse(a, b);
        if (Fraction3["REDUCE"]) {
          a = gcd(P["d"], P["n"]);
        } else {
          a = 1;
        }
        this["s"] = P["s"];
        this["n"] = P["n"] / a;
        this["d"] = P["d"] / a;
      }
      Fraction3["REDUCE"] = 1;
      Fraction3.prototype = {
        s: 1,
        n: 0,
        d: 1,
        abs: function() {
          return new Fraction3(this["n"], this["d"]);
        },
        neg: function() {
          return new Fraction3(-this["s"] * this["n"], this["d"]);
        },
        add: function(a, b) {
          parse(a, b);
          return new Fraction3(this["s"] * this["n"] * P["d"] + P["s"] * this["d"] * P["n"], this["d"] * P["d"]);
        },
        sub: function(a, b) {
          parse(a, b);
          return new Fraction3(this["s"] * this["n"] * P["d"] - P["s"] * this["d"] * P["n"], this["d"] * P["d"]);
        },
        mul: function(a, b) {
          parse(a, b);
          return new Fraction3(this["s"] * P["s"] * this["n"] * P["n"], this["d"] * P["d"]);
        },
        div: function(a, b) {
          parse(a, b);
          return new Fraction3(this["s"] * P["s"] * this["n"] * P["d"], this["d"] * P["n"]);
        },
        clone: function() {
          return new Fraction3(this);
        },
        mod: function(a, b) {
          if (isNaN(this["n"]) || isNaN(this["d"])) {
            return new Fraction3(NaN);
          }
          if (a === void 0) {
            return new Fraction3(this["s"] * this["n"] % this["d"], 1);
          }
          parse(a, b);
          if (P["n"] === 0 && this["d"] === 0) {
            Fraction3(0, 0);
          }
          return new Fraction3(this["s"] * (P["d"] * this["n"]) % (P["n"] * this["d"]), P["d"] * this["d"]);
        },
        gcd: function(a, b) {
          parse(a, b);
          return new Fraction3(gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]), P["d"] * this["d"]);
        },
        lcm: function(a, b) {
          parse(a, b);
          if (P["n"] === 0 && this["n"] === 0) {
            return new Fraction3();
          }
          return new Fraction3(P["n"] * this["n"], gcd(P["n"], this["n"]) * gcd(P["d"], this["d"]));
        },
        ceil: function(places) {
          places = Math.pow(10, places || 0);
          if (isNaN(this["n"]) || isNaN(this["d"])) {
            return new Fraction3(NaN);
          }
          return new Fraction3(Math.ceil(places * this["s"] * this["n"] / this["d"]), places);
        },
        floor: function(places) {
          places = Math.pow(10, places || 0);
          if (isNaN(this["n"]) || isNaN(this["d"])) {
            return new Fraction3(NaN);
          }
          return new Fraction3(Math.floor(places * this["s"] * this["n"] / this["d"]), places);
        },
        round: function(places) {
          places = Math.pow(10, places || 0);
          if (isNaN(this["n"]) || isNaN(this["d"])) {
            return new Fraction3(NaN);
          }
          return new Fraction3(Math.round(places * this["s"] * this["n"] / this["d"]), places);
        },
        inverse: function() {
          return new Fraction3(this["s"] * this["d"], this["n"]);
        },
        pow: function(m) {
          if (m < 0) {
            return new Fraction3(Math.pow(this["s"] * this["d"], -m), Math.pow(this["n"], -m));
          } else {
            return new Fraction3(Math.pow(this["s"] * this["n"], m), Math.pow(this["d"], m));
          }
        },
        equals: function(a, b) {
          parse(a, b);
          return this["s"] * this["n"] * P["d"] === P["s"] * P["n"] * this["d"];
        },
        compare: function(a, b) {
          parse(a, b);
          var t = this["s"] * this["n"] * P["d"] - P["s"] * P["n"] * this["d"];
          return (0 < t) - (t < 0);
        },
        simplify: function(eps) {
          if (isNaN(this["n"]) || isNaN(this["d"])) {
            return this;
          }
          var cont = this["abs"]()["toContinued"]();
          eps = eps || 1e-3;
          function rec(a) {
            if (a.length === 1)
              return new Fraction3(a[0]);
            return rec(a.slice(1))["inverse"]()["add"](a[0]);
          }
          for (var i = 0; i < cont.length; i++) {
            var tmp = rec(cont.slice(0, i + 1));
            if (tmp["sub"](this["abs"]())["abs"]().valueOf() < eps) {
              return tmp["mul"](this["s"]);
            }
          }
          return this;
        },
        divisible: function(a, b) {
          parse(a, b);
          return !(!(P["n"] * this["d"]) || this["n"] * P["d"] % (P["n"] * this["d"]));
        },
        valueOf: function() {
          return this["s"] * this["n"] / this["d"];
        },
        toFraction: function(excludeWhole) {
          var whole, str = "";
          var n = this["n"];
          var d = this["d"];
          if (this["s"] < 0) {
            str += "-";
          }
          if (d === 1) {
            str += n;
          } else {
            if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
              str += whole;
              str += " ";
              n %= d;
            }
            str += n;
            str += "/";
            str += d;
          }
          return str;
        },
        toLatex: function(excludeWhole) {
          var whole, str = "";
          var n = this["n"];
          var d = this["d"];
          if (this["s"] < 0) {
            str += "-";
          }
          if (d === 1) {
            str += n;
          } else {
            if (excludeWhole && (whole = Math.floor(n / d)) > 0) {
              str += whole;
              n %= d;
            }
            str += "\\frac{";
            str += n;
            str += "}{";
            str += d;
            str += "}";
          }
          return str;
        },
        toContinued: function() {
          var t;
          var a = this["n"];
          var b = this["d"];
          var res = [];
          if (isNaN(this["n"]) || isNaN(this["d"])) {
            return res;
          }
          do {
            res.push(Math.floor(a / b));
            t = a % b;
            a = b;
            b = t;
          } while (a !== 1);
          return res;
        },
        toString: function(dec) {
          var g;
          var N = this["n"];
          var D = this["d"];
          if (isNaN(N) || isNaN(D)) {
            return "NaN";
          }
          if (!Fraction3["REDUCE"]) {
            g = gcd(N, D);
            N /= g;
            D /= g;
          }
          dec = dec || 15;
          var cycLen = cycleLen(N, D);
          var cycOff = cycleStart(N, D, cycLen);
          var str = this["s"] === -1 ? "-" : "";
          str += N / D | 0;
          N %= D;
          N *= 10;
          if (N)
            str += ".";
          if (cycLen) {
            for (var i = cycOff; i--; ) {
              str += N / D | 0;
              N %= D;
              N *= 10;
            }
            str += "(";
            for (var i = cycLen; i--; ) {
              str += N / D | 0;
              N %= D;
              N *= 10;
            }
            str += ")";
          } else {
            for (var i = dec; N && i--; ) {
              str += N / D | 0;
              N %= D;
              N *= 10;
            }
          }
          return str;
        }
      };
      if (typeof define === "function" && define["amd"]) {
        define([], function() {
          return Fraction3;
        });
      } else if (typeof exports === "object") {
        Object.defineProperty(exports, "__esModule", {value: true});
        Fraction3["default"] = Fraction3;
        Fraction3["Fraction"] = Fraction3;
        module["exports"] = Fraction3;
      } else {
        root["Fraction"] = Fraction3;
      }
    })(exports);
  });

  // node_modules/seedrandom/lib/alea.js
  var require_alea = __commonJS((exports, module) => {
    (function(global, module2, define2) {
      function Alea(seed) {
        var me = this, mash = Mash();
        me.next = function() {
          var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;
          me.s0 = me.s1;
          me.s1 = me.s2;
          return me.s2 = t - (me.c = t | 0);
        };
        me.c = 1;
        me.s0 = mash(" ");
        me.s1 = mash(" ");
        me.s2 = mash(" ");
        me.s0 -= mash(seed);
        if (me.s0 < 0) {
          me.s0 += 1;
        }
        me.s1 -= mash(seed);
        if (me.s1 < 0) {
          me.s1 += 1;
        }
        me.s2 -= mash(seed);
        if (me.s2 < 0) {
          me.s2 += 1;
        }
        mash = null;
      }
      function copy(f, t) {
        t.c = f.c;
        t.s0 = f.s0;
        t.s1 = f.s1;
        t.s2 = f.s2;
        return t;
      }
      function impl(seed, opts) {
        var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
        prng.int32 = function() {
          return xg.next() * 4294967296 | 0;
        };
        prng.double = function() {
          return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
        };
        prng.quick = prng;
        if (state) {
          if (typeof state == "object")
            copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      function Mash() {
        var n = 4022871197;
        var mash = function(data) {
          data = String(data);
          for (var i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            var h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 4294967296;
          }
          return (n >>> 0) * 23283064365386963e-26;
        };
        return mash;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.alea = impl;
      }
    })(exports, typeof module == "object" && module, typeof define == "function" && define);
  });

  // node_modules/seedrandom/lib/xor128.js
  var require_xor128 = __commonJS((exports, module) => {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this, strseed = "";
        me.x = 0;
        me.y = 0;
        me.z = 0;
        me.w = 0;
        me.next = function() {
          var t = me.x ^ me.x << 11;
          me.x = me.y;
          me.y = me.z;
          me.z = me.w;
          return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
        };
        if (seed === (seed | 0)) {
          me.x = seed;
        } else {
          strseed += seed;
        }
        for (var k = 0; k < strseed.length + 64; k++) {
          me.x ^= strseed.charCodeAt(k) | 0;
          me.next();
        }
      }
      function copy(f, t) {
        t.x = f.x;
        t.y = f.y;
        t.z = f.z;
        t.w = f.w;
        return t;
      }
      function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (typeof state == "object")
            copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xor128 = impl;
      }
    })(exports, typeof module == "object" && module, typeof define == "function" && define);
  });

  // node_modules/seedrandom/lib/xorwow.js
  var require_xorwow = __commonJS((exports, module) => {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this, strseed = "";
        me.next = function() {
          var t = me.x ^ me.x >>> 2;
          me.x = me.y;
          me.y = me.z;
          me.z = me.w;
          me.w = me.v;
          return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
        };
        me.x = 0;
        me.y = 0;
        me.z = 0;
        me.w = 0;
        me.v = 0;
        if (seed === (seed | 0)) {
          me.x = seed;
        } else {
          strseed += seed;
        }
        for (var k = 0; k < strseed.length + 64; k++) {
          me.x ^= strseed.charCodeAt(k) | 0;
          if (k == strseed.length) {
            me.d = me.x << 10 ^ me.x >>> 4;
          }
          me.next();
        }
      }
      function copy(f, t) {
        t.x = f.x;
        t.y = f.y;
        t.z = f.z;
        t.w = f.w;
        t.v = f.v;
        t.d = f.d;
        return t;
      }
      function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (typeof state == "object")
            copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xorwow = impl;
      }
    })(exports, typeof module == "object" && module, typeof define == "function" && define);
  });

  // node_modules/seedrandom/lib/xorshift7.js
  var require_xorshift7 = __commonJS((exports, module) => {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this;
        me.next = function() {
          var X = me.x, i = me.i, t, v, w;
          t = X[i];
          t ^= t >>> 7;
          v = t ^ t << 24;
          t = X[i + 1 & 7];
          v ^= t ^ t >>> 10;
          t = X[i + 3 & 7];
          v ^= t ^ t >>> 3;
          t = X[i + 4 & 7];
          v ^= t ^ t << 7;
          t = X[i + 7 & 7];
          t = t ^ t << 13;
          v ^= t ^ t << 9;
          X[i] = v;
          me.i = i + 1 & 7;
          return v;
        };
        function init(me2, seed2) {
          var j, w, X = [];
          if (seed2 === (seed2 | 0)) {
            w = X[0] = seed2;
          } else {
            seed2 = "" + seed2;
            for (j = 0; j < seed2.length; ++j) {
              X[j & 7] = X[j & 7] << 15 ^ seed2.charCodeAt(j) + X[j + 1 & 7] << 13;
            }
          }
          while (X.length < 8)
            X.push(0);
          for (j = 0; j < 8 && X[j] === 0; ++j)
            ;
          if (j == 8)
            w = X[7] = -1;
          else
            w = X[j];
          me2.x = X;
          me2.i = 0;
          for (j = 256; j > 0; --j) {
            me2.next();
          }
        }
        init(me, seed);
      }
      function copy(f, t) {
        t.x = f.x.slice();
        t.i = f.i;
        return t;
      }
      function impl(seed, opts) {
        if (seed == null)
          seed = +new Date();
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (state.x)
            copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xorshift7 = impl;
      }
    })(exports, typeof module == "object" && module, typeof define == "function" && define);
  });

  // node_modules/seedrandom/lib/xor4096.js
  var require_xor4096 = __commonJS((exports, module) => {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this;
        me.next = function() {
          var w = me.w, X = me.X, i = me.i, t, v;
          me.w = w = w + 1640531527 | 0;
          v = X[i + 34 & 127];
          t = X[i = i + 1 & 127];
          v ^= v << 13;
          t ^= t << 17;
          v ^= v >>> 15;
          t ^= t >>> 12;
          v = X[i] = v ^ t;
          me.i = i;
          return v + (w ^ w >>> 16) | 0;
        };
        function init(me2, seed2) {
          var t, v, i, j, w, X = [], limit = 128;
          if (seed2 === (seed2 | 0)) {
            v = seed2;
            seed2 = null;
          } else {
            seed2 = seed2 + "\0";
            v = 0;
            limit = Math.max(limit, seed2.length);
          }
          for (i = 0, j = -32; j < limit; ++j) {
            if (seed2)
              v ^= seed2.charCodeAt((j + 32) % seed2.length);
            if (j === 0)
              w = v;
            v ^= v << 10;
            v ^= v >>> 15;
            v ^= v << 4;
            v ^= v >>> 13;
            if (j >= 0) {
              w = w + 1640531527 | 0;
              t = X[j & 127] ^= v + w;
              i = t == 0 ? i + 1 : 0;
            }
          }
          if (i >= 128) {
            X[(seed2 && seed2.length || 0) & 127] = -1;
          }
          i = 127;
          for (j = 4 * 128; j > 0; --j) {
            v = X[i + 34 & 127];
            t = X[i = i + 1 & 127];
            v ^= v << 13;
            t ^= t << 17;
            v ^= v >>> 15;
            t ^= t >>> 12;
            X[i] = v ^ t;
          }
          me2.w = w;
          me2.X = X;
          me2.i = i;
        }
        init(me, seed);
      }
      function copy(f, t) {
        t.i = f.i;
        t.w = f.w;
        t.X = f.X.slice();
        return t;
      }
      ;
      function impl(seed, opts) {
        if (seed == null)
          seed = +new Date();
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (state.X)
            copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.xor4096 = impl;
      }
    })(exports, typeof module == "object" && module, typeof define == "function" && define);
  });

  // node_modules/seedrandom/lib/tychei.js
  var require_tychei = __commonJS((exports, module) => {
    (function(global, module2, define2) {
      function XorGen(seed) {
        var me = this, strseed = "";
        me.next = function() {
          var b = me.b, c = me.c, d = me.d, a = me.a;
          b = b << 25 ^ b >>> 7 ^ c;
          c = c - d | 0;
          d = d << 24 ^ d >>> 8 ^ a;
          a = a - b | 0;
          me.b = b = b << 20 ^ b >>> 12 ^ c;
          me.c = c = c - d | 0;
          me.d = d << 16 ^ c >>> 16 ^ a;
          return me.a = a - b | 0;
        };
        me.a = 0;
        me.b = 0;
        me.c = 2654435769 | 0;
        me.d = 1367130551;
        if (seed === Math.floor(seed)) {
          me.a = seed / 4294967296 | 0;
          me.b = seed | 0;
        } else {
          strseed += seed;
        }
        for (var k = 0; k < strseed.length + 20; k++) {
          me.b ^= strseed.charCodeAt(k) | 0;
          me.next();
        }
      }
      function copy(f, t) {
        t.a = f.a;
        t.b = f.b;
        t.c = f.c;
        t.d = f.d;
        return t;
      }
      ;
      function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
          return (xg.next() >>> 0) / 4294967296;
        };
        prng.double = function() {
          do {
            var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
          } while (result === 0);
          return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
          if (typeof state == "object")
            copy(state, xg);
          prng.state = function() {
            return copy(xg, {});
          };
        }
        return prng;
      }
      if (module2 && module2.exports) {
        module2.exports = impl;
      } else if (define2 && define2.amd) {
        define2(function() {
          return impl;
        });
      } else {
        this.tychei = impl;
      }
    })(exports, typeof module == "object" && module, typeof define == "function" && define);
  });

  // empty:crypto
  var require_crypto = __commonJS(() => {
  });

  // node_modules/seedrandom/seedrandom.js
  var require_seedrandom = __commonJS((exports, module) => {
    (function(global, pool, math2) {
      var width = 256, chunks = 6, digits2 = 52, rngname = "random", startdenom = math2.pow(width, chunks), significance = math2.pow(2, digits2), overflow = significance * 2, mask = width - 1, nodecrypto;
      function seedrandom3(seed, options, callback) {
        var key = [];
        options = options == true ? {entropy: true} : options || {};
        var shortseed = mixkey(flatten2(options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed, 3), key);
        var arc4 = new ARC4(key);
        var prng = function() {
          var n = arc4.g(chunks), d = startdenom, x = 0;
          while (n < significance) {
            n = (n + x) * width;
            d *= width;
            x = arc4.g(1);
          }
          while (n >= overflow) {
            n /= 2;
            d /= 2;
            x >>>= 1;
          }
          return (n + x) / d;
        };
        prng.int32 = function() {
          return arc4.g(4) | 0;
        };
        prng.quick = function() {
          return arc4.g(4) / 4294967296;
        };
        prng.double = prng;
        mixkey(tostring(arc4.S), pool);
        return (options.pass || callback || function(prng2, seed2, is_math_call, state) {
          if (state) {
            if (state.S) {
              copy(state, arc4);
            }
            prng2.state = function() {
              return copy(arc4, {});
            };
          }
          if (is_math_call) {
            math2[rngname] = prng2;
            return seed2;
          } else
            return prng2;
        })(prng, shortseed, "global" in options ? options.global : this == math2, options.state);
      }
      function ARC4(key) {
        var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
        if (!keylen) {
          key = [keylen++];
        }
        while (i < width) {
          s[i] = i++;
        }
        for (i = 0; i < width; i++) {
          s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
          s[j] = t;
        }
        (me.g = function(count) {
          var t2, r = 0, i2 = me.i, j2 = me.j, s2 = me.S;
          while (count--) {
            t2 = s2[i2 = mask & i2 + 1];
            r = r * width + s2[mask & (s2[i2] = s2[j2 = mask & j2 + t2]) + (s2[j2] = t2)];
          }
          me.i = i2;
          me.j = j2;
          return r;
        })(width);
      }
      function copy(f, t) {
        t.i = f.i;
        t.j = f.j;
        t.S = f.S.slice();
        return t;
      }
      ;
      function flatten2(obj, depth) {
        var result = [], typ = typeof obj, prop;
        if (depth && typ == "object") {
          for (prop in obj) {
            try {
              result.push(flatten2(obj[prop], depth - 1));
            } catch (e3) {
            }
          }
        }
        return result.length ? result : typ == "string" ? obj : obj + "\0";
      }
      function mixkey(seed, key) {
        var stringseed = seed + "", smear, j = 0;
        while (j < stringseed.length) {
          key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
        }
        return tostring(key);
      }
      function autoseed() {
        try {
          var out;
          if (nodecrypto && (out = nodecrypto.randomBytes)) {
            out = out(width);
          } else {
            out = new Uint8Array(width);
            (global.crypto || global.msCrypto).getRandomValues(out);
          }
          return tostring(out);
        } catch (e3) {
          var browser = global.navigator, plugins = browser && browser.plugins;
          return [+new Date(), global, plugins, global.screen, tostring(pool)];
        }
      }
      function tostring(a) {
        return String.fromCharCode.apply(0, a);
      }
      mixkey(math2.random(), pool);
      if (typeof module == "object" && module.exports) {
        module.exports = seedrandom3;
        try {
          nodecrypto = require_crypto();
        } catch (ex) {
        }
      } else if (typeof define == "function" && define.amd) {
        define(function() {
          return seedrandom3;
        });
      } else {
        math2["seed" + rngname] = seedrandom3;
      }
    })(typeof self !== "undefined" ? self : exports, [], Math);
  });

  // node_modules/seedrandom/index.js
  var require_seedrandom2 = __commonJS((exports, module) => {
    var alea = require_alea();
    var xor128 = require_xor128();
    var xorwow = require_xorwow();
    var xorshift7 = require_xorshift7();
    var xor4096 = require_xor4096();
    var tychei = require_tychei();
    var sr = require_seedrandom();
    sr.alea = alea;
    sr.xor128 = xor128;
    sr.xorwow = xorwow;
    sr.xorshift7 = xorshift7;
    sr.xor4096 = xor4096;
    sr.tychei = tychei;
    module.exports = sr;
  });

  // src/workers/processImage/Image.ts
  class Image {
    constructor(bytes, width, height) {
      this.bytes = bytes;
      this.width = width;
      this.height = height;
    }
    static withSize(width, height) {
      const bytes = new Uint8ClampedArray(width * height);
      return new Image(bytes, width, height);
    }
    clone() {
      return new Image(new Uint8ClampedArray(this.bytes), this.width, this.height);
    }
    subImage(x1, y1, x2, y2) {
      const width = x2 - x1;
      const height = y2 - y1;
      const bytes = new Uint8ClampedArray(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          bytes[y * width + x] = this.bytes[(y + y1) * this.width + x + x1];
        }
      }
      return new Image(bytes, width, height);
    }
    toImageData() {
      const imageData = new ImageData(this.width, this.height);
      for (let y = 0; y < this.height; y++) {
        const row = y * this.width;
        for (let x = 0; x < this.width; x++) {
          const value = this.bytes[row + x];
          imageData.data[(row + x) * 4] = value;
          imageData.data[(row + x) * 4 + 1] = value;
          imageData.data[(row + x) * 4 + 2] = value;
          imageData.data[(row + x) * 4 + 3] = 255;
        }
      }
      return imageData;
    }
  }

  // src/workers/processImage/boxBlur.ts
  function precompute(bytes, width, height) {
    const result = new Array(bytes.length);
    let dst = 0;
    let src = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let tot = bytes[src];
        if (x > 0)
          tot += result[dst - 1];
        if (y > 0)
          tot += result[dst - width];
        if (x > 0 && y > 0)
          tot -= result[dst - width - 1];
        result[dst] = tot;
        dst++;
        src++;
      }
    }
    return result;
  }
  function readP(precomputed, w, h, x, y) {
    if (x < 0)
      x = 0;
    else if (x >= w)
      x = w - 1;
    if (y < 0)
      y = 0;
    else if (y >= h)
      y = h - 1;
    return precomputed[x + y * w];
  }
  function boxBlur(src, boxw, boxh) {
    const {width, height, bytes} = src;
    const precomputed = precompute(bytes, width, height);
    const result = new Uint8ClampedArray(width * height);
    let dst = 0;
    const mul = 1 / ((boxw * 2 + 1) * (boxh * 2 + 1));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tot = readP(precomputed, width, height, x + boxw, y + boxh) + readP(precomputed, width, height, x - boxw, y - boxh) - readP(precomputed, width, height, x - boxw, y + boxh) - readP(precomputed, width, height, x + boxw, y - boxh);
        result[dst] = tot * mul;
        dst++;
      }
    }
    return new Image(result, width, height);
  }

  // src/workers/processImage/adaptiveThreshold.ts
  function adaptiveThreshold(image, threshold, blurSize) {
    const {width, height, bytes} = image;
    const blurred = boxBlur(image, blurSize, blurSize);
    const blurredBytes = blurred.bytes;
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        bytes[row + width + x] = blurredBytes[row + x] - bytes[row + width + x] > threshold ? 255 : 0;
      }
    }
    return image;
  }

  // src/workers/processImage/applyHomographicTransform.ts
  function extractSquareFromRegion(source, size2, tranform) {
    const {a, b, c, d, e: e3, f, g, h} = tranform;
    const result = Image.withSize(size2, size2);
    for (let y = 0; y < size2; y++) {
      const sxPre1 = b * y + c;
      const sxPre2 = h * y + 1;
      const syPre1 = e3 * y + f;
      const syPre2 = h * y + 1;
      for (let x = 0; x < size2; x++) {
        const sx = Math.floor((a * x + sxPre1) / (g * x + sxPre2));
        const sy = Math.floor((d * x + syPre1) / (g * x + syPre2));
        result.bytes[y * size2 + x] = source.bytes[sy * source.width + sx];
      }
    }
    return result;
  }

  // src/workers/processImage/getLargestConnectedComponent.ts
  class ConnectedRegion {
    constructor(points, topLeft, bottomRight) {
      this.points = points;
      this.bounds = {topLeft, bottomRight};
    }
    getWidth() {
      return this.bounds.bottomRight.x - this.bounds.topLeft.x;
    }
    getHeight() {
      return this.bounds.bottomRight.y - this.bounds.topLeft.y;
    }
    getAspectRatio() {
      return this.getWidth() / this.getHeight();
    }
  }
  function getConnectedComponent(image, x, y) {
    const {width, height, bytes} = image;
    let minX = x;
    let minY = y;
    let maxX = x;
    let maxY = y;
    const points = [];
    const frontier = [];
    points.push({x, y});
    frontier.push({x, y});
    bytes[y * width + x] = 0;
    while (frontier.length > 0) {
      const seed = frontier.pop();
      minX = Math.min(seed.x, minX);
      maxX = Math.max(seed.x, maxX);
      minY = Math.min(seed.y, minY);
      maxY = Math.max(seed.y, maxY);
      for (let dy = Math.max(0, seed.y - 1); dy < height && dy <= seed.y + 1; dy++) {
        for (let dx = Math.max(0, seed.x - 1); dx < width && dx <= seed.x + 1; dx++) {
          if (bytes[dy * width + dx] === 255) {
            points.push({x: dx, y: dy});
            frontier.push({x: dx, y: dy});
            bytes[dy * width + dx] = 0;
          }
        }
      }
    }
    return new ConnectedRegion(points, {x: minX, y: minY}, {x: maxX, y: maxY});
  }
  function getLargestConnectedComponent(image, {
    minAspectRatio,
    maxAspectRatio,
    minSize,
    maxSize
  }) {
    let maxRegion = null;
    const tmp = image.clone();
    const {width, height, bytes} = tmp;
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        if (bytes[row + x] === 255) {
          const region = getConnectedComponent(tmp, x, y);
          const width2 = region.bounds.bottomRight.x - region.bounds.topLeft.x;
          const height2 = region.bounds.bottomRight.y - region.bounds.topLeft.y;
          if (region.getAspectRatio() >= minAspectRatio && region.getAspectRatio() <= maxAspectRatio && height2 >= minSize && width2 >= minSize && height2 <= maxSize && width2 <= maxSize) {
            if (!maxRegion || region.points.length > maxRegion.points.length) {
              maxRegion = region;
            }
          }
        }
      }
    }
    return maxRegion;
  }

  // src/workers/processImage/extractBoxes.ts
  function extractBoxes(greyScale, thresholded) {
    const results = [];
    const size2 = greyScale.width;
    const boxSize = size2 / 9;
    const searchSize = boxSize / 5;
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxX = 0;
        let maxY = 0;
        let pointsCount = 0;
        const searchX1 = x * boxSize + searchSize;
        const searchY1 = y * boxSize + searchSize;
        const searchX2 = x * boxSize + boxSize - searchSize;
        const searchY2 = y * boxSize + boxSize - searchSize;
        for (let searchY = searchY1; searchY < searchY2; searchY++) {
          for (let searchX = searchX1; searchX < searchX2; searchX++) {
            if (thresholded.bytes[searchY * size2 + searchX] === 255) {
              const component = getConnectedComponent(thresholded, searchX, searchY);
              const foundWidth2 = component.bounds.bottomRight.x - component.bounds.topLeft.x;
              const foundHeight2 = component.bounds.bottomRight.y - component.bounds.topLeft.y;
              if (component.points.length > 10 && foundWidth2 < boxSize && foundHeight2 < boxSize) {
                minX = Math.min(minX, component.bounds.topLeft.x);
                minY = Math.min(minY, component.bounds.topLeft.y);
                maxX = Math.max(maxX, component.bounds.bottomRight.x);
                maxY = Math.max(maxY, component.bounds.bottomRight.y);
                pointsCount += component.points.length;
              }
            }
          }
        }
        const foundWidth = maxX - minX;
        const foundHeight = maxY - minY;
        if (pointsCount > 10 && foundWidth < boxSize && foundHeight < boxSize && foundWidth > boxSize / 10 && foundHeight > boxSize / 3) {
          const numberImage = greyScale.subImage(Math.max(0, minX - 2), Math.max(0, minY - 2), Math.min(size2 - 1, maxX + 2), Math.min(size2 - 1, maxY + 2));
          results.push({
            x,
            y,
            minX,
            maxX,
            minY,
            maxY,
            numberImage,
            contents: 0
          });
        }
      }
    }
    return results;
  }

  // node_modules/mathjs/lib/esm/core/config.js
  var DEFAULT_CONFIG = {
    epsilon: 1e-12,
    matrix: "Matrix",
    number: "number",
    precision: 64,
    predictable: false,
    randomSeed: null
  };

  // node_modules/mathjs/lib/esm/utils/is.js
  function isNumber(x) {
    return typeof x === "number";
  }
  function isBigNumber(x) {
    return x && x.constructor.prototype.isBigNumber === true || false;
  }
  function isComplex(x) {
    return x && typeof x === "object" && Object.getPrototypeOf(x).isComplex === true || false;
  }
  function isFraction(x) {
    return x && typeof x === "object" && Object.getPrototypeOf(x).isFraction === true || false;
  }
  function isUnit(x) {
    return x && x.constructor.prototype.isUnit === true || false;
  }
  function isString(x) {
    return typeof x === "string";
  }
  var isArray = Array.isArray;
  function isMatrix(x) {
    return x && x.constructor.prototype.isMatrix === true || false;
  }
  function isCollection(x) {
    return Array.isArray(x) || isMatrix(x);
  }
  function isDenseMatrix(x) {
    return x && x.isDenseMatrix && x.constructor.prototype.isMatrix === true || false;
  }
  function isSparseMatrix(x) {
    return x && x.isSparseMatrix && x.constructor.prototype.isMatrix === true || false;
  }
  function isRange(x) {
    return x && x.constructor.prototype.isRange === true || false;
  }
  function isIndex(x) {
    return x && x.constructor.prototype.isIndex === true || false;
  }
  function isBoolean(x) {
    return typeof x === "boolean";
  }
  function isResultSet(x) {
    return x && x.constructor.prototype.isResultSet === true || false;
  }
  function isHelp(x) {
    return x && x.constructor.prototype.isHelp === true || false;
  }
  function isFunction(x) {
    return typeof x === "function";
  }
  function isDate(x) {
    return x instanceof Date;
  }
  function isRegExp(x) {
    return x instanceof RegExp;
  }
  function isObject(x) {
    return !!(x && typeof x === "object" && x.constructor === Object && !isComplex(x) && !isFraction(x));
  }
  function isNull(x) {
    return x === null;
  }
  function isUndefined(x) {
    return x === void 0;
  }
  function isAccessorNode(x) {
    return x && x.isAccessorNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isArrayNode(x) {
    return x && x.isArrayNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isAssignmentNode(x) {
    return x && x.isAssignmentNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isBlockNode(x) {
    return x && x.isBlockNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isConditionalNode(x) {
    return x && x.isConditionalNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isConstantNode(x) {
    return x && x.isConstantNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isFunctionAssignmentNode(x) {
    return x && x.isFunctionAssignmentNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isFunctionNode(x) {
    return x && x.isFunctionNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isIndexNode(x) {
    return x && x.isIndexNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isNode(x) {
    return x && x.isNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isObjectNode(x) {
    return x && x.isObjectNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isOperatorNode(x) {
    return x && x.isOperatorNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isParenthesisNode(x) {
    return x && x.isParenthesisNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isRangeNode(x) {
    return x && x.isRangeNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isSymbolNode(x) {
    return x && x.isSymbolNode === true && x.constructor.prototype.isNode === true || false;
  }
  function isChain(x) {
    return x && x.constructor.prototype.isChain === true || false;
  }
  function typeOf(x) {
    var t = typeof x;
    if (t === "object") {
      if (x === null)
        return "null";
      if (Array.isArray(x))
        return "Array";
      if (x instanceof Date)
        return "Date";
      if (x instanceof RegExp)
        return "RegExp";
      if (isBigNumber(x))
        return "BigNumber";
      if (isComplex(x))
        return "Complex";
      if (isFraction(x))
        return "Fraction";
      if (isMatrix(x))
        return "Matrix";
      if (isUnit(x))
        return "Unit";
      if (isIndex(x))
        return "Index";
      if (isRange(x))
        return "Range";
      if (isResultSet(x))
        return "ResultSet";
      if (isNode(x))
        return x.type;
      if (isChain(x))
        return "Chain";
      if (isHelp(x))
        return "Help";
      return "Object";
    }
    if (t === "function")
      return "Function";
    return t;
  }

  // node_modules/mathjs/lib/esm/utils/object.js
  function clone(x) {
    var type = typeof x;
    if (type === "number" || type === "string" || type === "boolean" || x === null || x === void 0) {
      return x;
    }
    if (typeof x.clone === "function") {
      return x.clone();
    }
    if (Array.isArray(x)) {
      return x.map(function(value) {
        return clone(value);
      });
    }
    if (x instanceof Date)
      return new Date(x.valueOf());
    if (isBigNumber(x))
      return x;
    if (x instanceof RegExp)
      throw new TypeError("Cannot clone " + x);
    return mapObject(x, clone);
  }
  function mapObject(object13, callback) {
    var clone2 = {};
    for (var key in object13) {
      if (hasOwnProperty(object13, key)) {
        clone2[key] = callback(object13[key]);
      }
    }
    return clone2;
  }
  function extend(a, b) {
    for (var prop in b) {
      if (hasOwnProperty(b, prop)) {
        a[prop] = b[prop];
      }
    }
    return a;
  }
  function deepStrictEqual(a, b) {
    var prop, i, len;
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      for (i = 0, len = a.length; i < len; i++) {
        if (!deepStrictEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    } else if (typeof a === "function") {
      return a === b;
    } else if (a instanceof Object) {
      if (Array.isArray(b) || !(b instanceof Object)) {
        return false;
      }
      for (prop in a) {
        if (!(prop in b) || !deepStrictEqual(a[prop], b[prop])) {
          return false;
        }
      }
      for (prop in b) {
        if (!(prop in a) || !deepStrictEqual(a[prop], b[prop])) {
          return false;
        }
      }
      return true;
    } else {
      return a === b;
    }
  }
  function hasOwnProperty(object13, property) {
    return object13 && Object.hasOwnProperty.call(object13, property);
  }
  function pickShallow(object13, properties) {
    var copy = {};
    for (var i = 0; i < properties.length; i++) {
      var key = properties[i];
      var value = object13[key];
      if (value !== void 0) {
        copy[key] = value;
      }
    }
    return copy;
  }

  // node_modules/mathjs/lib/esm/core/function/config.js
  var MATRIX_OPTIONS = ["Matrix", "Array"];
  var NUMBER_OPTIONS = ["number", "BigNumber", "Fraction"];

  // node_modules/mathjs/lib/esm/entry/configReadonly.js
  function _extends() {
    _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  var config3 = function config4(options) {
    if (options) {
      throw new Error("The global config is readonly. \nPlease create a mathjs instance if you want to change the default configuration. \nExample:\n\n  import { create, all } from 'mathjs';\n  const mathjs = create(all);\n  mathjs.config({ number: 'BigNumber' });\n");
    }
    return Object.freeze(DEFAULT_CONFIG);
  };
  _extends(config3, DEFAULT_CONFIG, {
    MATRIX_OPTIONS,
    NUMBER_OPTIONS
  });

  // node_modules/mathjs/lib/esm/core/function/typed.js
  const typed_function = __toModule(require_typed_function());

  // node_modules/mathjs/lib/esm/utils/number.js
  function isInteger(value) {
    if (typeof value === "boolean") {
      return true;
    }
    return isFinite(value) ? value === Math.round(value) : false;
  }
  var sign = Math.sign || function(x) {
    if (x > 0) {
      return 1;
    } else if (x < 0) {
      return -1;
    } else {
      return 0;
    }
  };
  var log2 = Math.log2 || function log22(x) {
    return Math.log(x) / Math.LN2;
  };
  var log10 = Math.log10 || function log102(x) {
    return Math.log(x) / Math.LN10;
  };
  var log1p = Math.log1p || function(x) {
    return Math.log(x + 1);
  };
  var cbrt = Math.cbrt || function cbrt2(x) {
    if (x === 0) {
      return x;
    }
    var negate = x < 0;
    var result;
    if (negate) {
      x = -x;
    }
    if (isFinite(x)) {
      result = Math.exp(Math.log(x) / 3);
      result = (x / (result * result) + 2 * result) / 3;
    } else {
      result = x;
    }
    return negate ? -result : result;
  };
  var expm1 = Math.expm1 || function expm12(x) {
    return x >= 2e-4 || x <= -2e-4 ? Math.exp(x) - 1 : x + x * x / 2 + x * x * x / 6;
  };
  function format(value, options) {
    if (typeof options === "function") {
      return options(value);
    }
    if (value === Infinity) {
      return "Infinity";
    } else if (value === -Infinity) {
      return "-Infinity";
    } else if (isNaN(value)) {
      return "NaN";
    }
    var notation = "auto";
    var precision;
    if (options) {
      if (options.notation) {
        notation = options.notation;
      }
      if (isNumber(options)) {
        precision = options;
      } else if (isNumber(options.precision)) {
        precision = options.precision;
      }
    }
    switch (notation) {
      case "fixed":
        return toFixed(value, precision);
      case "exponential":
        return toExponential(value, precision);
      case "engineering":
        return toEngineering(value, precision);
      case "auto":
        return toPrecision(value, precision, options && options).replace(/((\.\d*?)(0+))($|e)/, function() {
          var digits2 = arguments[2];
          var e3 = arguments[4];
          return digits2 !== "." ? digits2 + e3 : e3;
        });
      default:
        throw new Error('Unknown notation "' + notation + '". Choose "auto", "exponential", or "fixed".');
    }
  }
  function splitNumber(value) {
    var match = String(value).toLowerCase().match(/^0*?(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
    if (!match) {
      throw new SyntaxError("Invalid number " + value);
    }
    var sign2 = match[1];
    var digits2 = match[2];
    var exponent = parseFloat(match[4] || "0");
    var dot2 = digits2.indexOf(".");
    exponent += dot2 !== -1 ? dot2 - 1 : digits2.length - 1;
    var coefficients = digits2.replace(".", "").replace(/^0*/, function(zeros3) {
      exponent -= zeros3.length;
      return "";
    }).replace(/0*$/, "").split("").map(function(d) {
      return parseInt(d);
    });
    if (coefficients.length === 0) {
      coefficients.push(0);
      exponent++;
    }
    return {
      sign: sign2,
      coefficients,
      exponent
    };
  }
  function toEngineering(value, precision) {
    if (isNaN(value) || !isFinite(value)) {
      return String(value);
    }
    var split = splitNumber(value);
    var rounded = roundDigits(split, precision);
    var e3 = rounded.exponent;
    var c = rounded.coefficients;
    var newExp = e3 % 3 === 0 ? e3 : e3 < 0 ? e3 - 3 - e3 % 3 : e3 - e3 % 3;
    if (isNumber(precision)) {
      while (precision > c.length || e3 - newExp + 1 > c.length) {
        c.push(0);
      }
    } else {
      var missingZeros = Math.abs(e3 - newExp) - (c.length - 1);
      for (var i = 0; i < missingZeros; i++) {
        c.push(0);
      }
    }
    var expDiff = Math.abs(e3 - newExp);
    var decimalIdx = 1;
    while (expDiff > 0) {
      decimalIdx++;
      expDiff--;
    }
    var decimals = c.slice(decimalIdx).join("");
    var decimalVal = isNumber(precision) && decimals.length || decimals.match(/[1-9]/) ? "." + decimals : "";
    var str = c.slice(0, decimalIdx).join("") + decimalVal + "e" + (e3 >= 0 ? "+" : "") + newExp.toString();
    return rounded.sign + str;
  }
  function toFixed(value, precision) {
    if (isNaN(value) || !isFinite(value)) {
      return String(value);
    }
    var splitValue = splitNumber(value);
    var rounded = typeof precision === "number" ? roundDigits(splitValue, splitValue.exponent + 1 + precision) : splitValue;
    var c = rounded.coefficients;
    var p = rounded.exponent + 1;
    var pp = p + (precision || 0);
    if (c.length < pp) {
      c = c.concat(zeros(pp - c.length));
    }
    if (p < 0) {
      c = zeros(-p + 1).concat(c);
      p = 1;
    }
    if (p < c.length) {
      c.splice(p, 0, p === 0 ? "0." : ".");
    }
    return rounded.sign + c.join("");
  }
  function toExponential(value, precision) {
    if (isNaN(value) || !isFinite(value)) {
      return String(value);
    }
    var split = splitNumber(value);
    var rounded = precision ? roundDigits(split, precision) : split;
    var c = rounded.coefficients;
    var e3 = rounded.exponent;
    if (c.length < precision) {
      c = c.concat(zeros(precision - c.length));
    }
    var first = c.shift();
    return rounded.sign + first + (c.length > 0 ? "." + c.join("") : "") + "e" + (e3 >= 0 ? "+" : "") + e3;
  }
  function toPrecision(value, precision, options) {
    if (isNaN(value) || !isFinite(value)) {
      return String(value);
    }
    var lowerExp = options && options.lowerExp !== void 0 ? options.lowerExp : -3;
    var upperExp = options && options.upperExp !== void 0 ? options.upperExp : 5;
    var split = splitNumber(value);
    var rounded = precision ? roundDigits(split, precision) : split;
    if (rounded.exponent < lowerExp || rounded.exponent >= upperExp) {
      return toExponential(value, precision);
    } else {
      var c = rounded.coefficients;
      var e3 = rounded.exponent;
      if (c.length < precision) {
        c = c.concat(zeros(precision - c.length));
      }
      c = c.concat(zeros(e3 - c.length + 1 + (c.length < precision ? precision - c.length : 0)));
      c = zeros(-e3).concat(c);
      var dot2 = e3 > 0 ? e3 : 0;
      if (dot2 < c.length - 1) {
        c.splice(dot2 + 1, 0, ".");
      }
      return rounded.sign + c.join("");
    }
  }
  function roundDigits(split, precision) {
    var rounded = {
      sign: split.sign,
      coefficients: split.coefficients,
      exponent: split.exponent
    };
    var c = rounded.coefficients;
    while (precision <= 0) {
      c.unshift(0);
      rounded.exponent++;
      precision++;
    }
    if (c.length > precision) {
      var removed = c.splice(precision, c.length - precision);
      if (removed[0] >= 5) {
        var i = precision - 1;
        c[i]++;
        while (c[i] === 10) {
          c.pop();
          if (i === 0) {
            c.unshift(0);
            rounded.exponent++;
            i++;
          }
          i--;
          c[i]++;
        }
      }
    }
    return rounded;
  }
  function zeros(length) {
    var arr = [];
    for (var i = 0; i < length; i++) {
      arr.push(0);
    }
    return arr;
  }
  function digits(value) {
    return value.toExponential().replace(/e.*$/, "").replace(/^0\.?0*|\./, "").length;
  }
  var DBL_EPSILON = Number.EPSILON || 2220446049250313e-31;
  function nearlyEqual(x, y, epsilon) {
    if (epsilon === null || epsilon === void 0) {
      return x === y;
    }
    if (x === y) {
      return true;
    }
    if (isNaN(x) || isNaN(y)) {
      return false;
    }
    if (isFinite(x) && isFinite(y)) {
      var diff = Math.abs(x - y);
      if (diff < DBL_EPSILON) {
        return true;
      } else {
        return diff <= Math.max(Math.abs(x), Math.abs(y)) * epsilon;
      }
    }
    return false;
  }
  var acosh = Math.acosh || function(x) {
    return Math.log(Math.sqrt(x * x - 1) + x);
  };
  var asinh = Math.asinh || function(x) {
    return Math.log(Math.sqrt(x * x + 1) + x);
  };
  var atanh = Math.atanh || function(x) {
    return Math.log((1 + x) / (1 - x)) / 2;
  };
  var cosh = Math.cosh || function(x) {
    return (Math.exp(x) + Math.exp(-x)) / 2;
  };
  var sinh = Math.sinh || function(x) {
    return (Math.exp(x) - Math.exp(-x)) / 2;
  };
  var tanh = Math.tanh || function(x) {
    var e3 = Math.exp(2 * x);
    return (e3 - 1) / (e3 + 1);
  };

  // node_modules/mathjs/lib/esm/utils/bignumber/formatter.js
  function format2(value, options) {
    if (typeof options === "function") {
      return options(value);
    }
    if (!value.isFinite()) {
      return value.isNaN() ? "NaN" : value.gt(0) ? "Infinity" : "-Infinity";
    }
    var notation = "auto";
    var precision;
    if (options !== void 0) {
      if (options.notation) {
        notation = options.notation;
      }
      if (typeof options === "number") {
        precision = options;
      } else if (options.precision) {
        precision = options.precision;
      }
    }
    switch (notation) {
      case "fixed":
        return toFixed2(value, precision);
      case "exponential":
        return toExponential2(value, precision);
      case "engineering":
        return toEngineering2(value, precision);
      case "auto": {
        var lowerExp = options && options.lowerExp !== void 0 ? options.lowerExp : -3;
        var upperExp = options && options.upperExp !== void 0 ? options.upperExp : 5;
        if (value.isZero())
          return "0";
        var str;
        var rounded = value.toSignificantDigits(precision);
        var exp = rounded.e;
        if (exp >= lowerExp && exp < upperExp) {
          str = rounded.toFixed();
        } else {
          str = toExponential2(value, precision);
        }
        return str.replace(/((\.\d*?)(0+))($|e)/, function() {
          var digits2 = arguments[2];
          var e3 = arguments[4];
          return digits2 !== "." ? digits2 + e3 : e3;
        });
      }
      default:
        throw new Error('Unknown notation "' + notation + '". Choose "auto", "exponential", or "fixed".');
    }
  }
  function toEngineering2(value, precision) {
    var e3 = value.e;
    var newExp = e3 % 3 === 0 ? e3 : e3 < 0 ? e3 - 3 - e3 % 3 : e3 - e3 % 3;
    var valueWithoutExp = value.mul(Math.pow(10, -newExp));
    var valueStr = valueWithoutExp.toPrecision(precision);
    if (valueStr.indexOf("e") !== -1) {
      valueStr = valueWithoutExp.toString();
    }
    return valueStr + "e" + (e3 >= 0 ? "+" : "") + newExp.toString();
  }
  function toExponential2(value, precision) {
    if (precision !== void 0) {
      return value.toExponential(precision - 1);
    } else {
      return value.toExponential();
    }
  }
  function toFixed2(value, precision) {
    return value.toFixed(precision);
  }

  // node_modules/mathjs/lib/esm/utils/string.js
  function endsWith(text, search) {
    var start = text.length - search.length;
    var end = text.length;
    return text.substring(start, end) === search;
  }
  function format3(value, options) {
    if (typeof value === "number") {
      return format(value, options);
    }
    if (isBigNumber(value)) {
      return format2(value, options);
    }
    if (looksLikeFraction(value)) {
      if (!options || options.fraction !== "decimal") {
        return value.s * value.n + "/" + value.d;
      } else {
        return value.toString();
      }
    }
    if (Array.isArray(value)) {
      return formatArray(value, options);
    }
    if (isString(value)) {
      return '"' + value + '"';
    }
    if (typeof value === "function") {
      return value.syntax ? String(value.syntax) : "function";
    }
    if (value && typeof value === "object") {
      if (typeof value.format === "function") {
        return value.format(options);
      } else if (value && value.toString(options) !== {}.toString()) {
        return value.toString(options);
      } else {
        var entries = Object.keys(value).map((key) => {
          return '"' + key + '": ' + format3(value[key], options);
        });
        return "{" + entries.join(", ") + "}";
      }
    }
    return String(value);
  }
  function formatArray(array13, options) {
    if (Array.isArray(array13)) {
      var str = "[";
      var len = array13.length;
      for (var i = 0; i < len; i++) {
        if (i !== 0) {
          str += ", ";
        }
        str += formatArray(array13[i], options);
      }
      str += "]";
      return str;
    } else {
      return format3(array13, options);
    }
  }
  function looksLikeFraction(value) {
    return value && typeof value === "object" && typeof value.s === "number" && typeof value.n === "number" && typeof value.d === "number" || false;
  }

  // node_modules/mathjs/lib/esm/error/DimensionError.js
  function DimensionError(actual, expected, relation) {
    if (!(this instanceof DimensionError)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.actual = actual;
    this.expected = expected;
    this.relation = relation;
    this.message = "Dimension mismatch (" + (Array.isArray(actual) ? "[" + actual.join(", ") + "]" : actual) + " " + (this.relation || "!=") + " " + (Array.isArray(expected) ? "[" + expected.join(", ") + "]" : expected) + ")";
    this.stack = new Error().stack;
  }
  DimensionError.prototype = new RangeError();
  DimensionError.prototype.constructor = RangeError;
  DimensionError.prototype.name = "DimensionError";
  DimensionError.prototype.isDimensionError = true;

  // node_modules/mathjs/lib/esm/error/IndexError.js
  function IndexError(index, min2, max2) {
    if (!(this instanceof IndexError)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.index = index;
    if (arguments.length < 3) {
      this.min = 0;
      this.max = min2;
    } else {
      this.min = min2;
      this.max = max2;
    }
    if (this.min !== void 0 && this.index < this.min) {
      this.message = "Index out of range (" + this.index + " < " + this.min + ")";
    } else if (this.max !== void 0 && this.index >= this.max) {
      this.message = "Index out of range (" + this.index + " > " + (this.max - 1) + ")";
    } else {
      this.message = "Index out of range (" + this.index + ")";
    }
    this.stack = new Error().stack;
  }
  IndexError.prototype = new RangeError();
  IndexError.prototype.constructor = RangeError;
  IndexError.prototype.name = "IndexError";
  IndexError.prototype.isIndexError = true;

  // node_modules/mathjs/lib/esm/utils/array.js
  function arraySize(x) {
    var s = [];
    while (Array.isArray(x)) {
      s.push(x.length);
      x = x[0];
    }
    return s;
  }
  function _validate(array13, size2, dim) {
    var i;
    var len = array13.length;
    if (len !== size2[dim]) {
      throw new DimensionError(len, size2[dim]);
    }
    if (dim < size2.length - 1) {
      var dimNext = dim + 1;
      for (i = 0; i < len; i++) {
        var child = array13[i];
        if (!Array.isArray(child)) {
          throw new DimensionError(size2.length - 1, size2.length, "<");
        }
        _validate(array13[i], size2, dimNext);
      }
    } else {
      for (i = 0; i < len; i++) {
        if (Array.isArray(array13[i])) {
          throw new DimensionError(size2.length + 1, size2.length, ">");
        }
      }
    }
  }
  function validate(array13, size2) {
    var isScalar = size2.length === 0;
    if (isScalar) {
      if (Array.isArray(array13)) {
        throw new DimensionError(array13.length, 0);
      }
    } else {
      _validate(array13, size2, 0);
    }
  }
  function validateIndex(index, length) {
    if (!isNumber(index) || !isInteger(index)) {
      throw new TypeError("Index must be an integer (value: " + index + ")");
    }
    if (index < 0 || typeof length === "number" && index >= length) {
      throw new IndexError(index, length);
    }
  }
  function resize(array13, size2, defaultValue) {
    if (!Array.isArray(array13) || !Array.isArray(size2)) {
      throw new TypeError("Array expected");
    }
    if (size2.length === 0) {
      throw new Error("Resizing to scalar is not supported");
    }
    size2.forEach(function(value) {
      if (!isNumber(value) || !isInteger(value) || value < 0) {
        throw new TypeError("Invalid size, must contain positive integers (size: " + format3(size2) + ")");
      }
    });
    var _defaultValue = defaultValue !== void 0 ? defaultValue : 0;
    _resize(array13, size2, 0, _defaultValue);
    return array13;
  }
  function _resize(array13, size2, dim, defaultValue) {
    var i;
    var elem;
    var oldLen = array13.length;
    var newLen = size2[dim];
    var minLen = Math.min(oldLen, newLen);
    array13.length = newLen;
    if (dim < size2.length - 1) {
      var dimNext = dim + 1;
      for (i = 0; i < minLen; i++) {
        elem = array13[i];
        if (!Array.isArray(elem)) {
          elem = [elem];
          array13[i] = elem;
        }
        _resize(elem, size2, dimNext, defaultValue);
      }
      for (i = minLen; i < newLen; i++) {
        elem = [];
        array13[i] = elem;
        _resize(elem, size2, dimNext, defaultValue);
      }
    } else {
      for (i = 0; i < minLen; i++) {
        while (Array.isArray(array13[i])) {
          array13[i] = array13[i][0];
        }
      }
      for (i = minLen; i < newLen; i++) {
        array13[i] = defaultValue;
      }
    }
  }
  function reshape(array13, sizes) {
    var flatArray = flatten(array13);
    var newArray;
    function product3(arr) {
      return arr.reduce((prev, curr) => prev * curr);
    }
    if (!Array.isArray(array13) || !Array.isArray(sizes)) {
      throw new TypeError("Array expected");
    }
    if (sizes.length === 0) {
      throw new DimensionError(0, product3(arraySize(array13)), "!=");
    }
    var totalSize = 1;
    for (var sizeIndex = 0; sizeIndex < sizes.length; sizeIndex++) {
      totalSize *= sizes[sizeIndex];
    }
    if (flatArray.length !== totalSize) {
      throw new DimensionError(product3(sizes), product3(arraySize(array13)), "!=");
    }
    try {
      newArray = _reshape(flatArray, sizes);
    } catch (e3) {
      if (e3 instanceof DimensionError) {
        throw new DimensionError(product3(sizes), product3(arraySize(array13)), "!=");
      }
      throw e3;
    }
    return newArray;
  }
  function _reshape(array13, sizes) {
    var tmpArray = array13;
    var tmpArray2;
    for (var sizeIndex = sizes.length - 1; sizeIndex > 0; sizeIndex--) {
      var size2 = sizes[sizeIndex];
      tmpArray2 = [];
      var length = tmpArray.length / size2;
      for (var i = 0; i < length; i++) {
        tmpArray2.push(tmpArray.slice(i * size2, (i + 1) * size2));
      }
      tmpArray = tmpArray2;
    }
    return tmpArray;
  }
  function unsqueeze(array13, dims, outer, size2) {
    var s = size2 || arraySize(array13);
    if (outer) {
      for (var i = 0; i < outer; i++) {
        array13 = [array13];
        s.unshift(1);
      }
    }
    array13 = _unsqueeze(array13, dims, 0);
    while (s.length < dims) {
      s.push(1);
    }
    return array13;
  }
  function _unsqueeze(array13, dims, dim) {
    var i, ii;
    if (Array.isArray(array13)) {
      var next = dim + 1;
      for (i = 0, ii = array13.length; i < ii; i++) {
        array13[i] = _unsqueeze(array13[i], dims, next);
      }
    } else {
      for (var d = dim; d < dims; d++) {
        array13 = [array13];
      }
    }
    return array13;
  }
  function flatten(array13) {
    if (!Array.isArray(array13)) {
      return array13;
    }
    var flat = [];
    array13.forEach(function callback(value) {
      if (Array.isArray(value)) {
        value.forEach(callback);
      } else {
        flat.push(value);
      }
    });
    return flat;
  }
  function getArrayDataType(array13, typeOf2) {
    var type;
    var length = 0;
    for (var i = 0; i < array13.length; i++) {
      var item = array13[i];
      var isArray2 = Array.isArray(item);
      if (i === 0 && isArray2) {
        length = item.length;
      }
      if (isArray2 && item.length !== length) {
        return void 0;
      }
      var itemType = isArray2 ? getArrayDataType(item, typeOf2) : typeOf2(item);
      if (type === void 0) {
        type = itemType;
      } else if (type !== itemType) {
        return "mixed";
      } else {
      }
    }
    return type;
  }

  // node_modules/mathjs/lib/esm/utils/factory.js
  function factory(name94, dependencies95, create, meta) {
    function assertAndCreate(scope) {
      var deps = pickShallow(scope, dependencies95.map(stripOptionalNotation));
      assertDependencies(name94, dependencies95, scope);
      return create(deps);
    }
    assertAndCreate.isFactory = true;
    assertAndCreate.fn = name94;
    assertAndCreate.dependencies = dependencies95.slice().sort();
    if (meta) {
      assertAndCreate.meta = meta;
    }
    return assertAndCreate;
  }
  function assertDependencies(name94, dependencies95, scope) {
    var allDefined = dependencies95.filter((dependency) => !isOptionalDependency(dependency)).every((dependency) => scope[dependency] !== void 0);
    if (!allDefined) {
      var missingDependencies = dependencies95.filter((dependency) => scope[dependency] === void 0);
      throw new Error('Cannot create function "'.concat(name94, '", ') + "some dependencies are missing: ".concat(missingDependencies.map((d) => '"'.concat(d, '"')).join(", "), "."));
    }
  }
  function isOptionalDependency(dependency) {
    return dependency && dependency[0] === "?";
  }
  function stripOptionalNotation(dependency) {
    return dependency && dependency[0] === "?" ? dependency.slice(1) : dependency;
  }

  // node_modules/mathjs/lib/esm/core/function/typed.js
  var _createTyped2 = function _createTyped() {
    _createTyped2 = typed_function.default.create;
    return typed_function.default;
  };
  var dependencies = ["?BigNumber", "?Complex", "?DenseMatrix", "?Fraction"];
  var createTyped = /* @__PURE__ */ factory("typed", dependencies, function createTyped2(_ref) {
    var {
      BigNumber: BigNumber2,
      Complex: Complex3,
      DenseMatrix: DenseMatrix2,
      Fraction: Fraction3
    } = _ref;
    var typed2 = _createTyped2();
    typed2.types = [
      {
        name: "number",
        test: isNumber
      },
      {
        name: "Complex",
        test: isComplex
      },
      {
        name: "BigNumber",
        test: isBigNumber
      },
      {
        name: "Fraction",
        test: isFraction
      },
      {
        name: "Unit",
        test: isUnit
      },
      {
        name: "string",
        test: isString
      },
      {
        name: "Chain",
        test: isChain
      },
      {
        name: "Array",
        test: isArray
      },
      {
        name: "Matrix",
        test: isMatrix
      },
      {
        name: "DenseMatrix",
        test: isDenseMatrix
      },
      {
        name: "SparseMatrix",
        test: isSparseMatrix
      },
      {
        name: "Range",
        test: isRange
      },
      {
        name: "Index",
        test: isIndex
      },
      {
        name: "boolean",
        test: isBoolean
      },
      {
        name: "ResultSet",
        test: isResultSet
      },
      {
        name: "Help",
        test: isHelp
      },
      {
        name: "function",
        test: isFunction
      },
      {
        name: "Date",
        test: isDate
      },
      {
        name: "RegExp",
        test: isRegExp
      },
      {
        name: "null",
        test: isNull
      },
      {
        name: "undefined",
        test: isUndefined
      },
      {
        name: "AccessorNode",
        test: isAccessorNode
      },
      {
        name: "ArrayNode",
        test: isArrayNode
      },
      {
        name: "AssignmentNode",
        test: isAssignmentNode
      },
      {
        name: "BlockNode",
        test: isBlockNode
      },
      {
        name: "ConditionalNode",
        test: isConditionalNode
      },
      {
        name: "ConstantNode",
        test: isConstantNode
      },
      {
        name: "FunctionNode",
        test: isFunctionNode
      },
      {
        name: "FunctionAssignmentNode",
        test: isFunctionAssignmentNode
      },
      {
        name: "IndexNode",
        test: isIndexNode
      },
      {
        name: "Node",
        test: isNode
      },
      {
        name: "ObjectNode",
        test: isObjectNode
      },
      {
        name: "OperatorNode",
        test: isOperatorNode
      },
      {
        name: "ParenthesisNode",
        test: isParenthesisNode
      },
      {
        name: "RangeNode",
        test: isRangeNode
      },
      {
        name: "SymbolNode",
        test: isSymbolNode
      },
      {
        name: "Object",
        test: isObject
      }
    ];
    typed2.conversions = [{
      from: "number",
      to: "BigNumber",
      convert: function convert(x) {
        if (!BigNumber2) {
          throwNoBignumber(x);
        }
        if (digits(x) > 15) {
          throw new TypeError("Cannot implicitly convert a number with >15 significant digits to BigNumber (value: " + x + "). Use function bignumber(x) to convert to BigNumber.");
        }
        return new BigNumber2(x);
      }
    }, {
      from: "number",
      to: "Complex",
      convert: function convert(x) {
        if (!Complex3) {
          throwNoComplex(x);
        }
        return new Complex3(x, 0);
      }
    }, {
      from: "number",
      to: "string",
      convert: function convert(x) {
        return x + "";
      }
    }, {
      from: "BigNumber",
      to: "Complex",
      convert: function convert(x) {
        if (!Complex3) {
          throwNoComplex(x);
        }
        return new Complex3(x.toNumber(), 0);
      }
    }, {
      from: "Fraction",
      to: "BigNumber",
      convert: function convert(x) {
        throw new TypeError("Cannot implicitly convert a Fraction to BigNumber or vice versa. Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.");
      }
    }, {
      from: "Fraction",
      to: "Complex",
      convert: function convert(x) {
        if (!Complex3) {
          throwNoComplex(x);
        }
        return new Complex3(x.valueOf(), 0);
      }
    }, {
      from: "number",
      to: "Fraction",
      convert: function convert(x) {
        if (!Fraction3) {
          throwNoFraction(x);
        }
        var f = new Fraction3(x);
        if (f.valueOf() !== x) {
          throw new TypeError("Cannot implicitly convert a number to a Fraction when there will be a loss of precision (value: " + x + "). Use function fraction(x) to convert to Fraction.");
        }
        return f;
      }
    }, {
      from: "string",
      to: "number",
      convert: function convert(x) {
        var n = Number(x);
        if (isNaN(n)) {
          throw new Error('Cannot convert "' + x + '" to a number');
        }
        return n;
      }
    }, {
      from: "string",
      to: "BigNumber",
      convert: function convert(x) {
        if (!BigNumber2) {
          throwNoBignumber(x);
        }
        try {
          return new BigNumber2(x);
        } catch (err) {
          throw new Error('Cannot convert "' + x + '" to BigNumber');
        }
      }
    }, {
      from: "string",
      to: "Fraction",
      convert: function convert(x) {
        if (!Fraction3) {
          throwNoFraction(x);
        }
        try {
          return new Fraction3(x);
        } catch (err) {
          throw new Error('Cannot convert "' + x + '" to Fraction');
        }
      }
    }, {
      from: "string",
      to: "Complex",
      convert: function convert(x) {
        if (!Complex3) {
          throwNoComplex(x);
        }
        try {
          return new Complex3(x);
        } catch (err) {
          throw new Error('Cannot convert "' + x + '" to Complex');
        }
      }
    }, {
      from: "boolean",
      to: "number",
      convert: function convert(x) {
        return +x;
      }
    }, {
      from: "boolean",
      to: "BigNumber",
      convert: function convert(x) {
        if (!BigNumber2) {
          throwNoBignumber(x);
        }
        return new BigNumber2(+x);
      }
    }, {
      from: "boolean",
      to: "Fraction",
      convert: function convert(x) {
        if (!Fraction3) {
          throwNoFraction(x);
        }
        return new Fraction3(+x);
      }
    }, {
      from: "boolean",
      to: "string",
      convert: function convert(x) {
        return String(x);
      }
    }, {
      from: "Array",
      to: "Matrix",
      convert: function convert(array13) {
        if (!DenseMatrix2) {
          throwNoMatrix();
        }
        return new DenseMatrix2(array13);
      }
    }, {
      from: "Matrix",
      to: "Array",
      convert: function convert(matrix2) {
        return matrix2.valueOf();
      }
    }];
    return typed2;
  });
  function throwNoBignumber(x) {
    throw new Error("Cannot convert value ".concat(x, " into a BigNumber: no class 'BigNumber' provided"));
  }
  function throwNoComplex(x) {
    throw new Error("Cannot convert value ".concat(x, " into a Complex number: no class 'Complex' provided"));
  }
  function throwNoMatrix() {
    throw new Error("Cannot convert array into a Matrix: no class 'DenseMatrix' provided");
  }
  function throwNoFraction(x) {
    throw new Error("Cannot convert value ".concat(x, " into a Fraction, no class 'Fraction' provided."));
  }

  // node_modules/mathjs/lib/esm/type/bignumber/BigNumber.js
  const decimal = __toModule(require_decimal());
  var name = "BigNumber";
  var dependencies2 = ["?on", "config"];
  var createBigNumberClass = /* @__PURE__ */ factory(name, dependencies2, (_ref) => {
    var {
      on,
      config: config5
    } = _ref;
    var EUCLID = 9;
    var BigNumber2 = decimal.default.clone({
      precision: config5.precision,
      modulo: EUCLID
    });
    BigNumber2.prototype.type = "BigNumber";
    BigNumber2.prototype.isBigNumber = true;
    BigNumber2.prototype.toJSON = function() {
      return {
        mathjs: "BigNumber",
        value: this.toString()
      };
    };
    BigNumber2.fromJSON = function(json) {
      return new BigNumber2(json.value);
    };
    if (on) {
      on("config", function(curr, prev) {
        if (curr.precision !== prev.precision) {
          BigNumber2.config({
            precision: curr.precision
          });
        }
      });
    }
    return BigNumber2;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/type/complex/Complex.js
  const complex = __toModule(require_complex());
  var name2 = "Complex";
  var dependencies3 = [];
  var createComplexClass = /* @__PURE__ */ factory(name2, dependencies3, () => {
    complex.default.prototype.type = "Complex";
    complex.default.prototype.isComplex = true;
    complex.default.prototype.toJSON = function() {
      return {
        mathjs: "Complex",
        re: this.re,
        im: this.im
      };
    };
    complex.default.prototype.toPolar = function() {
      return {
        r: this.abs(),
        phi: this.arg()
      };
    };
    complex.default.prototype.format = function(options) {
      var str = "";
      var im = this.im;
      var re = this.re;
      var strRe = format(this.re, options);
      var strIm = format(this.im, options);
      var precision = isNumber(options) ? options : options ? options.precision : null;
      if (precision !== null) {
        var epsilon = Math.pow(10, -precision);
        if (Math.abs(re / im) < epsilon) {
          re = 0;
        }
        if (Math.abs(im / re) < epsilon) {
          im = 0;
        }
      }
      if (im === 0) {
        str = strRe;
      } else if (re === 0) {
        if (im === 1) {
          str = "i";
        } else if (im === -1) {
          str = "-i";
        } else {
          str = strIm + "i";
        }
      } else {
        if (im < 0) {
          if (im === -1) {
            str = strRe + " - i";
          } else {
            str = strRe + " - " + strIm.substring(1) + "i";
          }
        } else {
          if (im === 1) {
            str = strRe + " + i";
          } else {
            str = strRe + " + " + strIm + "i";
          }
        }
      }
      return str;
    };
    complex.default.fromPolar = function(args) {
      switch (arguments.length) {
        case 1: {
          var arg = arguments[0];
          if (typeof arg === "object") {
            return complex.default(arg);
          } else {
            throw new TypeError("Input has to be an object with r and phi keys.");
          }
        }
        case 2: {
          var r = arguments[0];
          var phi3 = arguments[1];
          if (isNumber(r)) {
            if (isUnit(phi3) && phi3.hasBase("ANGLE")) {
              phi3 = phi3.toNumber("rad");
            }
            if (isNumber(phi3)) {
              return new complex.default({
                r,
                phi: phi3
              });
            }
            throw new TypeError("Phi is not a number nor an angle unit.");
          } else {
            throw new TypeError("Radius r is not a number.");
          }
        }
        default:
          throw new SyntaxError("Wrong number of arguments in function fromPolar");
      }
    };
    complex.default.prototype.valueOf = complex.default.prototype.toString;
    complex.default.fromJSON = function(json) {
      return new complex.default(json);
    };
    complex.default.compare = function(a, b) {
      if (a.re > b.re) {
        return 1;
      }
      if (a.re < b.re) {
        return -1;
      }
      if (a.im > b.im) {
        return 1;
      }
      if (a.im < b.im) {
        return -1;
      }
      return 0;
    };
    return complex.default;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/type/fraction/Fraction.js
  const fraction = __toModule(require_fraction());
  var name3 = "Fraction";
  var dependencies4 = [];
  var createFractionClass = /* @__PURE__ */ factory(name3, dependencies4, () => {
    fraction.default.prototype.type = "Fraction";
    fraction.default.prototype.isFraction = true;
    fraction.default.prototype.toJSON = function() {
      return {
        mathjs: "Fraction",
        n: this.s * this.n,
        d: this.d
      };
    };
    fraction.default.fromJSON = function(json) {
      return new fraction.default(json);
    };
    return fraction.default;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/type/matrix/Matrix.js
  var name4 = "Matrix";
  var dependencies5 = [];
  var createMatrixClass = /* @__PURE__ */ factory(name4, dependencies5, () => {
    function Matrix2() {
      if (!(this instanceof Matrix2)) {
        throw new SyntaxError("Constructor must be called with the new operator");
      }
    }
    Matrix2.prototype.type = "Matrix";
    Matrix2.prototype.isMatrix = true;
    Matrix2.prototype.storage = function() {
      throw new Error("Cannot invoke storage on a Matrix interface");
    };
    Matrix2.prototype.datatype = function() {
      throw new Error("Cannot invoke datatype on a Matrix interface");
    };
    Matrix2.prototype.create = function(data, datatype) {
      throw new Error("Cannot invoke create on a Matrix interface");
    };
    Matrix2.prototype.subset = function(index, replacement, defaultValue) {
      throw new Error("Cannot invoke subset on a Matrix interface");
    };
    Matrix2.prototype.get = function(index) {
      throw new Error("Cannot invoke get on a Matrix interface");
    };
    Matrix2.prototype.set = function(index, value, defaultValue) {
      throw new Error("Cannot invoke set on a Matrix interface");
    };
    Matrix2.prototype.resize = function(size2, defaultValue) {
      throw new Error("Cannot invoke resize on a Matrix interface");
    };
    Matrix2.prototype.reshape = function(size2, defaultValue) {
      throw new Error("Cannot invoke reshape on a Matrix interface");
    };
    Matrix2.prototype.clone = function() {
      throw new Error("Cannot invoke clone on a Matrix interface");
    };
    Matrix2.prototype.size = function() {
      throw new Error("Cannot invoke size on a Matrix interface");
    };
    Matrix2.prototype.map = function(callback, skipZeros) {
      throw new Error("Cannot invoke map on a Matrix interface");
    };
    Matrix2.prototype.forEach = function(callback) {
      throw new Error("Cannot invoke forEach on a Matrix interface");
    };
    Matrix2.prototype.toArray = function() {
      throw new Error("Cannot invoke toArray on a Matrix interface");
    };
    Matrix2.prototype.valueOf = function() {
      throw new Error("Cannot invoke valueOf on a Matrix interface");
    };
    Matrix2.prototype.format = function(options) {
      throw new Error("Cannot invoke format on a Matrix interface");
    };
    Matrix2.prototype.toString = function() {
      throw new Error("Cannot invoke toString on a Matrix interface");
    };
    return Matrix2;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/type/matrix/DenseMatrix.js
  var name5 = "DenseMatrix";
  var dependencies6 = ["Matrix"];
  var createDenseMatrixClass = /* @__PURE__ */ factory(name5, dependencies6, (_ref) => {
    var {
      Matrix: Matrix2
    } = _ref;
    function DenseMatrix2(data, datatype) {
      if (!(this instanceof DenseMatrix2)) {
        throw new SyntaxError("Constructor must be called with the new operator");
      }
      if (datatype && !isString(datatype)) {
        throw new Error("Invalid datatype: " + datatype);
      }
      if (isMatrix(data)) {
        if (data.type === "DenseMatrix") {
          this._data = clone(data._data);
          this._size = clone(data._size);
          this._datatype = datatype || data._datatype;
        } else {
          this._data = data.toArray();
          this._size = data.size();
          this._datatype = datatype || data._datatype;
        }
      } else if (data && isArray(data.data) && isArray(data.size)) {
        this._data = data.data;
        this._size = data.size;
        validate(this._data, this._size);
        this._datatype = datatype || data.datatype;
      } else if (isArray(data)) {
        this._data = preprocess(data);
        this._size = arraySize(this._data);
        validate(this._data, this._size);
        this._datatype = datatype;
      } else if (data) {
        throw new TypeError("Unsupported type of data (" + typeOf(data) + ")");
      } else {
        this._data = [];
        this._size = [0];
        this._datatype = datatype;
      }
    }
    DenseMatrix2.prototype = new Matrix2();
    DenseMatrix2.prototype.createDenseMatrix = function(data, datatype) {
      return new DenseMatrix2(data, datatype);
    };
    DenseMatrix2.prototype.type = "DenseMatrix";
    DenseMatrix2.prototype.isDenseMatrix = true;
    DenseMatrix2.prototype.getDataType = function() {
      return getArrayDataType(this._data, typeOf);
    };
    DenseMatrix2.prototype.storage = function() {
      return "dense";
    };
    DenseMatrix2.prototype.datatype = function() {
      return this._datatype;
    };
    DenseMatrix2.prototype.create = function(data, datatype) {
      return new DenseMatrix2(data, datatype);
    };
    DenseMatrix2.prototype.subset = function(index, replacement, defaultValue) {
      switch (arguments.length) {
        case 1:
          return _get(this, index);
        case 2:
        case 3:
          return _set(this, index, replacement, defaultValue);
        default:
          throw new SyntaxError("Wrong number of arguments");
      }
    };
    DenseMatrix2.prototype.get = function(index) {
      if (!isArray(index)) {
        throw new TypeError("Array expected");
      }
      if (index.length !== this._size.length) {
        throw new DimensionError(index.length, this._size.length);
      }
      for (var x = 0; x < index.length; x++) {
        validateIndex(index[x], this._size[x]);
      }
      var data = this._data;
      for (var i = 0, ii = index.length; i < ii; i++) {
        var indexI = index[i];
        validateIndex(indexI, data.length);
        data = data[indexI];
      }
      return data;
    };
    DenseMatrix2.prototype.set = function(index, value, defaultValue) {
      if (!isArray(index)) {
        throw new TypeError("Array expected");
      }
      if (index.length < this._size.length) {
        throw new DimensionError(index.length, this._size.length, "<");
      }
      var i, ii, indexI;
      var size2 = index.map(function(i2) {
        return i2 + 1;
      });
      _fit(this, size2, defaultValue);
      var data = this._data;
      for (i = 0, ii = index.length - 1; i < ii; i++) {
        indexI = index[i];
        validateIndex(indexI, data.length);
        data = data[indexI];
      }
      indexI = index[index.length - 1];
      validateIndex(indexI, data.length);
      data[indexI] = value;
      return this;
    };
    function _get(matrix2, index) {
      if (!isIndex(index)) {
        throw new TypeError("Invalid index");
      }
      var isScalar = index.isScalar();
      if (isScalar) {
        return matrix2.get(index.min());
      } else {
        var size2 = index.size();
        if (size2.length !== matrix2._size.length) {
          throw new DimensionError(size2.length, matrix2._size.length);
        }
        var min2 = index.min();
        var max2 = index.max();
        for (var i = 0, ii = matrix2._size.length; i < ii; i++) {
          validateIndex(min2[i], matrix2._size[i]);
          validateIndex(max2[i], matrix2._size[i]);
        }
        return new DenseMatrix2(_getSubmatrix(matrix2._data, index, size2.length, 0), matrix2._datatype);
      }
    }
    function _getSubmatrix(data, index, dims, dim) {
      var last = dim === dims - 1;
      var range2 = index.dimension(dim);
      if (last) {
        return range2.map(function(i) {
          validateIndex(i, data.length);
          return data[i];
        }).valueOf();
      } else {
        return range2.map(function(i) {
          validateIndex(i, data.length);
          var child = data[i];
          return _getSubmatrix(child, index, dims, dim + 1);
        }).valueOf();
      }
    }
    function _set(matrix2, index, submatrix, defaultValue) {
      if (!index || index.isIndex !== true) {
        throw new TypeError("Invalid index");
      }
      var iSize = index.size();
      var isScalar = index.isScalar();
      var sSize;
      if (isMatrix(submatrix)) {
        sSize = submatrix.size();
        submatrix = submatrix.valueOf();
      } else {
        sSize = arraySize(submatrix);
      }
      if (isScalar) {
        if (sSize.length !== 0) {
          throw new TypeError("Scalar expected");
        }
        matrix2.set(index.min(), submatrix, defaultValue);
      } else {
        if (iSize.length < matrix2._size.length) {
          throw new DimensionError(iSize.length, matrix2._size.length, "<");
        }
        if (sSize.length < iSize.length) {
          var i = 0;
          var outer = 0;
          while (iSize[i] === 1 && sSize[i] === 1) {
            i++;
          }
          while (iSize[i] === 1) {
            outer++;
            i++;
          }
          submatrix = unsqueeze(submatrix, iSize.length, outer, sSize);
        }
        if (!deepStrictEqual(iSize, sSize)) {
          throw new DimensionError(iSize, sSize, ">");
        }
        var size2 = index.max().map(function(i2) {
          return i2 + 1;
        });
        _fit(matrix2, size2, defaultValue);
        var dims = iSize.length;
        var dim = 0;
        _setSubmatrix(matrix2._data, index, submatrix, dims, dim);
      }
      return matrix2;
    }
    function _setSubmatrix(data, index, submatrix, dims, dim) {
      var last = dim === dims - 1;
      var range2 = index.dimension(dim);
      if (last) {
        range2.forEach(function(dataIndex, subIndex) {
          validateIndex(dataIndex);
          data[dataIndex] = submatrix[subIndex[0]];
        });
      } else {
        range2.forEach(function(dataIndex, subIndex) {
          validateIndex(dataIndex);
          _setSubmatrix(data[dataIndex], index, submatrix[subIndex[0]], dims, dim + 1);
        });
      }
    }
    DenseMatrix2.prototype.resize = function(size2, defaultValue, copy) {
      if (!isCollection(size2)) {
        throw new TypeError("Array or Matrix expected");
      }
      var sizeArray = size2.valueOf().map((value) => {
        return Array.isArray(value) && value.length === 1 ? value[0] : value;
      });
      var m = copy ? this.clone() : this;
      return _resize2(m, sizeArray, defaultValue);
    };
    function _resize2(matrix2, size2, defaultValue) {
      if (size2.length === 0) {
        var v = matrix2._data;
        while (isArray(v)) {
          v = v[0];
        }
        return v;
      }
      matrix2._size = size2.slice(0);
      matrix2._data = resize(matrix2._data, matrix2._size, defaultValue);
      return matrix2;
    }
    DenseMatrix2.prototype.reshape = function(size2, copy) {
      var m = copy ? this.clone() : this;
      m._data = reshape(m._data, size2);
      m._size = size2.slice(0);
      return m;
    };
    function _fit(matrix2, size2, defaultValue) {
      var newSize = matrix2._size.slice(0);
      var changed = false;
      while (newSize.length < size2.length) {
        newSize.push(0);
        changed = true;
      }
      for (var i = 0, ii = size2.length; i < ii; i++) {
        if (size2[i] > newSize[i]) {
          newSize[i] = size2[i];
          changed = true;
        }
      }
      if (changed) {
        _resize2(matrix2, newSize, defaultValue);
      }
    }
    DenseMatrix2.prototype.clone = function() {
      var m = new DenseMatrix2({
        data: clone(this._data),
        size: clone(this._size),
        datatype: this._datatype
      });
      return m;
    };
    DenseMatrix2.prototype.size = function() {
      return this._size.slice(0);
    };
    DenseMatrix2.prototype.map = function(callback) {
      var me = this;
      var recurse = function recurse2(value, index) {
        if (isArray(value)) {
          return value.map(function(child, i) {
            return recurse2(child, index.concat(i));
          });
        } else {
          return callback(value, index, me);
        }
      };
      var data = recurse(this._data, []);
      var datatype = this._datatype !== void 0 ? getArrayDataType(data, typeOf) : void 0;
      return new DenseMatrix2(data, datatype);
    };
    DenseMatrix2.prototype.forEach = function(callback) {
      var me = this;
      var recurse = function recurse2(value, index) {
        if (isArray(value)) {
          value.forEach(function(child, i) {
            recurse2(child, index.concat(i));
          });
        } else {
          callback(value, index, me);
        }
      };
      recurse(this._data, []);
    };
    DenseMatrix2.prototype.toArray = function() {
      return clone(this._data);
    };
    DenseMatrix2.prototype.valueOf = function() {
      return this._data;
    };
    DenseMatrix2.prototype.format = function(options) {
      return format3(this._data, options);
    };
    DenseMatrix2.prototype.toString = function() {
      return format3(this._data);
    };
    DenseMatrix2.prototype.toJSON = function() {
      return {
        mathjs: "DenseMatrix",
        data: this._data,
        size: this._size,
        datatype: this._datatype
      };
    };
    DenseMatrix2.prototype.diagonal = function(k) {
      if (k) {
        if (isBigNumber(k)) {
          k = k.toNumber();
        }
        if (!isNumber(k) || !isInteger(k)) {
          throw new TypeError("The parameter k must be an integer number");
        }
      } else {
        k = 0;
      }
      var kSuper = k > 0 ? k : 0;
      var kSub = k < 0 ? -k : 0;
      var rows = this._size[0];
      var columns = this._size[1];
      var n = Math.min(rows - kSub, columns - kSuper);
      var data = [];
      for (var i = 0; i < n; i++) {
        data[i] = this._data[i + kSub][i + kSuper];
      }
      return new DenseMatrix2({
        data,
        size: [n],
        datatype: this._datatype
      });
    };
    DenseMatrix2.diagonal = function(size2, value, k, defaultValue) {
      if (!isArray(size2)) {
        throw new TypeError("Array expected, size parameter");
      }
      if (size2.length !== 2) {
        throw new Error("Only two dimensions matrix are supported");
      }
      size2 = size2.map(function(s) {
        if (isBigNumber(s)) {
          s = s.toNumber();
        }
        if (!isNumber(s) || !isInteger(s) || s < 1) {
          throw new Error("Size values must be positive integers");
        }
        return s;
      });
      if (k) {
        if (isBigNumber(k)) {
          k = k.toNumber();
        }
        if (!isNumber(k) || !isInteger(k)) {
          throw new TypeError("The parameter k must be an integer number");
        }
      } else {
        k = 0;
      }
      var kSuper = k > 0 ? k : 0;
      var kSub = k < 0 ? -k : 0;
      var rows = size2[0];
      var columns = size2[1];
      var n = Math.min(rows - kSub, columns - kSuper);
      var _value;
      if (isArray(value)) {
        if (value.length !== n) {
          throw new Error("Invalid value array length");
        }
        _value = function _value2(i) {
          return value[i];
        };
      } else if (isMatrix(value)) {
        var ms = value.size();
        if (ms.length !== 1 || ms[0] !== n) {
          throw new Error("Invalid matrix length");
        }
        _value = function _value2(i) {
          return value.get([i]);
        };
      } else {
        _value = function _value2() {
          return value;
        };
      }
      if (!defaultValue) {
        defaultValue = isBigNumber(_value(0)) ? _value(0).mul(0) : 0;
      }
      var data = [];
      if (size2.length > 0) {
        data = resize(data, size2, defaultValue);
        for (var d = 0; d < n; d++) {
          data[d + kSub][d + kSuper] = _value(d);
        }
      }
      return new DenseMatrix2({
        data,
        size: [rows, columns]
      });
    };
    DenseMatrix2.fromJSON = function(json) {
      return new DenseMatrix2(json);
    };
    DenseMatrix2.prototype.swapRows = function(i, j) {
      if (!isNumber(i) || !isInteger(i) || !isNumber(j) || !isInteger(j)) {
        throw new Error("Row index must be positive integers");
      }
      if (this._size.length !== 2) {
        throw new Error("Only two dimensional matrix is supported");
      }
      validateIndex(i, this._size[0]);
      validateIndex(j, this._size[0]);
      DenseMatrix2._swapRows(i, j, this._data);
      return this;
    };
    DenseMatrix2._swapRows = function(i, j, data) {
      var vi = data[i];
      data[i] = data[j];
      data[j] = vi;
    };
    function preprocess(data) {
      for (var i = 0, ii = data.length; i < ii; i++) {
        var elem = data[i];
        if (isArray(elem)) {
          data[i] = preprocess(elem);
        } else if (elem && elem.isMatrix === true) {
          data[i] = preprocess(elem.valueOf());
        }
      }
      return data;
    }
    return DenseMatrix2;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/utils/collection.js
  function containsCollections(array13) {
    for (var i = 0; i < array13.length; i++) {
      if (isCollection(array13[i])) {
        return true;
      }
    }
    return false;
  }
  function deepForEach(array13, callback) {
    if (isMatrix(array13)) {
      array13 = array13.valueOf();
    }
    for (var i = 0, ii = array13.length; i < ii; i++) {
      var value = array13[i];
      if (Array.isArray(value)) {
        deepForEach(value, callback);
      } else {
        callback(value);
      }
    }
  }
  function deepMap(array13, callback, skipZeros) {
    if (array13 && typeof array13.map === "function") {
      return array13.map(function(x) {
        return deepMap(x, callback, skipZeros);
      });
    } else {
      return callback(array13);
    }
  }
  function reduce(mat, dim, callback) {
    var size2 = Array.isArray(mat) ? arraySize(mat) : mat.size();
    if (dim < 0 || dim >= size2.length) {
      throw new IndexError(dim, size2.length);
    }
    if (isMatrix(mat)) {
      return mat.create(_reduce(mat.valueOf(), dim, callback));
    } else {
      return _reduce(mat, dim, callback);
    }
  }
  function _reduce(mat, dim, callback) {
    var i, ret, val, tran;
    if (dim <= 0) {
      if (!Array.isArray(mat[0])) {
        val = mat[0];
        for (i = 1; i < mat.length; i++) {
          val = callback(val, mat[i]);
        }
        return val;
      } else {
        tran = _switch(mat);
        ret = [];
        for (i = 0; i < tran.length; i++) {
          ret[i] = _reduce(tran[i], dim - 1, callback);
        }
        return ret;
      }
    } else {
      ret = [];
      for (i = 0; i < mat.length; i++) {
        ret[i] = _reduce(mat[i], dim - 1, callback);
      }
      return ret;
    }
  }
  function _switch(mat) {
    var I = mat.length;
    var J = mat[0].length;
    var i, j;
    var ret = [];
    for (j = 0; j < J; j++) {
      var tmp = [];
      for (i = 0; i < I; i++) {
        tmp.push(mat[i][j]);
      }
      ret.push(tmp);
    }
    return ret;
  }

  // node_modules/mathjs/lib/esm/plain/number/arithmetic.js
  var n1 = "number";
  var n2 = "number, number";
  function absNumber(a) {
    return Math.abs(a);
  }
  absNumber.signature = n1;
  function addNumber(a, b) {
    return a + b;
  }
  addNumber.signature = n2;
  function subtractNumber(a, b) {
    return a - b;
  }
  subtractNumber.signature = n2;
  function multiplyNumber(a, b) {
    return a * b;
  }
  multiplyNumber.signature = n2;
  function divideNumber(a, b) {
    return a / b;
  }
  divideNumber.signature = n2;
  function unaryMinusNumber(x) {
    return -x;
  }
  unaryMinusNumber.signature = n1;
  function unaryPlusNumber(x) {
    return x;
  }
  unaryPlusNumber.signature = n1;
  function cbrtNumber(x) {
    return cbrt(x);
  }
  cbrtNumber.signature = n1;
  function ceilNumber(x) {
    return Math.ceil(x);
  }
  ceilNumber.signature = n1;
  function cubeNumber(x) {
    return x * x * x;
  }
  cubeNumber.signature = n1;
  function expNumber(x) {
    return Math.exp(x);
  }
  expNumber.signature = n1;
  function expm1Number(x) {
    return expm1(x);
  }
  expm1Number.signature = n1;
  function fixNumber(x) {
    return x > 0 ? Math.floor(x) : Math.ceil(x);
  }
  fixNumber.signature = n1;
  function floorNumber(x) {
    return Math.floor(x);
  }
  floorNumber.signature = n1;
  function gcdNumber(a, b) {
    if (!isInteger(a) || !isInteger(b)) {
      throw new Error("Parameters in function gcd must be integer numbers");
    }
    var r;
    while (b !== 0) {
      r = a % b;
      a = b;
      b = r;
    }
    return a < 0 ? -a : a;
  }
  gcdNumber.signature = n2;
  function lcmNumber(a, b) {
    if (!isInteger(a) || !isInteger(b)) {
      throw new Error("Parameters in function lcm must be integer numbers");
    }
    if (a === 0 || b === 0) {
      return 0;
    }
    var t;
    var prod2 = a * b;
    while (b !== 0) {
      t = b;
      b = a % t;
      a = t;
    }
    return Math.abs(prod2 / a);
  }
  lcmNumber.signature = n2;
  function logNumber(x) {
    return Math.log(x);
  }
  logNumber.signature = n1;
  function log10Number(x) {
    return log10(x);
  }
  log10Number.signature = n1;
  function log2Number(x) {
    return log2(x);
  }
  log2Number.signature = n1;
  function log1pNumber(x) {
    return log1p(x);
  }
  log1pNumber.signature = n1;
  function modNumber(x, y) {
    if (y > 0) {
      return x - y * Math.floor(x / y);
    } else if (y === 0) {
      return x;
    } else {
      throw new Error("Cannot calculate mod for a negative divisor");
    }
  }
  modNumber.signature = n2;
  function nthRootNumber(a, root) {
    var inv2 = root < 0;
    if (inv2) {
      root = -root;
    }
    if (root === 0) {
      throw new Error("Root must be non-zero");
    }
    if (a < 0 && Math.abs(root) % 2 !== 1) {
      throw new Error("Root must be odd when a is negative.");
    }
    if (a === 0) {
      return inv2 ? Infinity : 0;
    }
    if (!isFinite(a)) {
      return inv2 ? 0 : a;
    }
    var x = Math.pow(Math.abs(a), 1 / root);
    x = a < 0 ? -x : x;
    return inv2 ? 1 / x : x;
  }
  nthRootNumber.signature = n2;
  function signNumber(x) {
    return sign(x);
  }
  signNumber.signature = n1;
  function sqrtNumber(x) {
    return Math.sqrt(x);
  }
  sqrtNumber.signature = n1;
  function squareNumber(x) {
    return x * x;
  }
  squareNumber.signature = n1;
  function xgcdNumber(a, b) {
    var t;
    var q;
    var r;
    var x = 0;
    var lastx = 1;
    var y = 1;
    var lasty = 0;
    if (!isInteger(a) || !isInteger(b)) {
      throw new Error("Parameters in function xgcd must be integer numbers");
    }
    while (b) {
      q = Math.floor(a / b);
      r = a - q * b;
      t = x;
      x = lastx - q * x;
      lastx = t;
      t = y;
      y = lasty - q * y;
      lasty = t;
      a = b;
      b = r;
    }
    var res;
    if (a < 0) {
      res = [-a, -lastx, -lasty];
    } else {
      res = [a, a ? lastx : 0, lasty];
    }
    return res;
  }
  xgcdNumber.signature = n2;
  function powNumber(x, y) {
    if (x * x < 1 && y === Infinity || x * x > 1 && y === -Infinity) {
      return 0;
    }
    return Math.pow(x, y);
  }
  powNumber.signature = n2;
  function roundNumber(value) {
    var decimals = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return parseFloat(toFixed(value, decimals));
  }
  roundNumber.signature = n2;
  function normNumber(x) {
    return Math.abs(x);
  }
  normNumber.signature = n1;

  // node_modules/mathjs/lib/esm/utils/product.js
  function product(i, n) {
    if (n < i) {
      return 1;
    }
    if (n === i) {
      return n;
    }
    var half = n + i >> 1;
    return product(i, half) * product(half + 1, n);
  }

  // node_modules/mathjs/lib/esm/plain/number/constants.js
  var pi = Math.PI;
  var tau = 2 * Math.PI;
  var e = Math.E;
  var phi = 1.618033988749895;

  // node_modules/mathjs/lib/esm/plain/number/probability.js
  function gammaNumber(n) {
    var x;
    if (isInteger(n)) {
      if (n <= 0) {
        return isFinite(n) ? Infinity : NaN;
      }
      if (n > 171) {
        return Infinity;
      }
      return product(1, n - 1);
    }
    if (n < 0.5) {
      return Math.PI / (Math.sin(Math.PI * n) * gammaNumber(1 - n));
    }
    if (n >= 171.35) {
      return Infinity;
    }
    if (n > 85) {
      var twoN = n * n;
      var threeN = twoN * n;
      var fourN = threeN * n;
      var fiveN = fourN * n;
      return Math.sqrt(2 * Math.PI / n) * Math.pow(n / Math.E, n) * (1 + 1 / (12 * n) + 1 / (288 * twoN) - 139 / (51840 * threeN) - 571 / (2488320 * fourN) + 163879 / (209018880 * fiveN) + 5246819 / (75246796800 * fiveN * n));
    }
    --n;
    x = gammaP[0];
    for (var i = 1; i < gammaP.length; ++i) {
      x += gammaP[i] / (n + i);
    }
    var t = n + gammaG + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
  }
  gammaNumber.signature = "number";
  var gammaG = 4.7421875;
  var gammaP = [0.9999999999999971, 57.15623566586292, -59.59796035547549, 14.136097974741746, -0.4919138160976202, 3399464998481189e-20, 4652362892704858e-20, -9837447530487956e-20, 1580887032249125e-19, -21026444172410488e-20, 21743961811521265e-20, -1643181065367639e-19, 8441822398385275e-20, -26190838401581408e-21, 36899182659531625e-22];

  // node_modules/mathjs/lib/esm/plain/number/trigonometry.js
  var n12 = "number";
  var n22 = "number, number";
  function acosNumber(x) {
    return Math.acos(x);
  }
  acosNumber.signature = n12;
  function acoshNumber(x) {
    return acosh(x);
  }
  acoshNumber.signature = n12;
  function acotNumber(x) {
    return Math.atan(1 / x);
  }
  acotNumber.signature = n12;
  function acothNumber(x) {
    return isFinite(x) ? (Math.log((x + 1) / x) + Math.log(x / (x - 1))) / 2 : 0;
  }
  acothNumber.signature = n12;
  function acscNumber(x) {
    return Math.asin(1 / x);
  }
  acscNumber.signature = n12;
  function acschNumber(x) {
    var xInv = 1 / x;
    return Math.log(xInv + Math.sqrt(xInv * xInv + 1));
  }
  acschNumber.signature = n12;
  function asecNumber(x) {
    return Math.acos(1 / x);
  }
  asecNumber.signature = n12;
  function asechNumber(x) {
    var xInv = 1 / x;
    var ret = Math.sqrt(xInv * xInv - 1);
    return Math.log(ret + xInv);
  }
  asechNumber.signature = n12;
  function asinNumber(x) {
    return Math.asin(x);
  }
  asinNumber.signature = n12;
  function asinhNumber(x) {
    return asinh(x);
  }
  asinhNumber.signature = n12;
  function atanNumber(x) {
    return Math.atan(x);
  }
  atanNumber.signature = n12;
  function atan2Number(y, x) {
    return Math.atan2(y, x);
  }
  atan2Number.signature = n22;
  function atanhNumber(x) {
    return atanh(x);
  }
  atanhNumber.signature = n12;
  function cosNumber(x) {
    return Math.cos(x);
  }
  cosNumber.signature = n12;
  function coshNumber(x) {
    return cosh(x);
  }
  coshNumber.signature = n12;
  function cotNumber(x) {
    return 1 / Math.tan(x);
  }
  cotNumber.signature = n12;
  function cothNumber(x) {
    var e3 = Math.exp(2 * x);
    return (e3 + 1) / (e3 - 1);
  }
  cothNumber.signature = n12;
  function cscNumber(x) {
    return 1 / Math.sin(x);
  }
  cscNumber.signature = n12;
  function cschNumber(x) {
    if (x === 0) {
      return Number.POSITIVE_INFINITY;
    } else {
      return Math.abs(2 / (Math.exp(x) - Math.exp(-x))) * sign(x);
    }
  }
  cschNumber.signature = n12;
  function secNumber(x) {
    return 1 / Math.cos(x);
  }
  secNumber.signature = n12;
  function sechNumber(x) {
    return 2 / (Math.exp(x) + Math.exp(-x));
  }
  sechNumber.signature = n12;
  function sinNumber(x) {
    return Math.sin(x);
  }
  sinNumber.signature = n12;
  function sinhNumber(x) {
    return sinh(x);
  }
  sinhNumber.signature = n12;
  function tanNumber(x) {
    return Math.tan(x);
  }
  tanNumber.signature = n12;
  function tanhNumber(x) {
    return tanh(x);
  }
  tanhNumber.signature = n12;

  // node_modules/mathjs/lib/esm/plain/number/utils.js
  var n13 = "number";
  function isIntegerNumber(x) {
    return isInteger(x);
  }
  isIntegerNumber.signature = n13;
  function isNegativeNumber(x) {
    return x < 0;
  }
  isNegativeNumber.signature = n13;
  function isPositiveNumber(x) {
    return x > 0;
  }
  isPositiveNumber.signature = n13;
  function isZeroNumber(x) {
    return x === 0;
  }
  isZeroNumber.signature = n13;
  function isNaNNumber(x) {
    return Number.isNaN(x);
  }
  isNaNNumber.signature = n13;

  // node_modules/mathjs/lib/esm/function/utils/isNegative.js
  var name6 = "isNegative";
  var dependencies7 = ["typed"];
  var createIsNegative = /* @__PURE__ */ factory(name6, dependencies7, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name6, {
      number: isNegativeNumber,
      BigNumber: function BigNumber2(x) {
        return x.isNeg() && !x.isZero() && !x.isNaN();
      },
      Fraction: function Fraction3(x) {
        return x.s < 0;
      },
      Unit: function Unit2(x) {
        return this(x.value);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/utils/isNumeric.js
  var name7 = "isNumeric";
  var dependencies8 = ["typed"];
  var createIsNumeric = /* @__PURE__ */ factory(name7, dependencies8, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name7, {
      "number | BigNumber | Fraction | boolean": function numberBigNumberFractionBoolean() {
        return true;
      },
      "Complex | Unit | string | null | undefined | Node": function ComplexUnitStringNullUndefinedNode() {
        return false;
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/utils/bignumber/nearlyEqual.js
  function nearlyEqual2(x, y, epsilon) {
    if (epsilon === null || epsilon === void 0) {
      return x.eq(y);
    }
    if (x.eq(y)) {
      return true;
    }
    if (x.isNaN() || y.isNaN()) {
      return false;
    }
    if (x.isFinite() && y.isFinite()) {
      var diff = x.minus(y).abs();
      if (diff.isZero()) {
        return true;
      } else {
        var max2 = x.constructor.max(x.abs(), y.abs());
        return diff.lte(max2.times(epsilon));
      }
    }
    return false;
  }

  // node_modules/mathjs/lib/esm/utils/complex.js
  function complexEquals(x, y, epsilon) {
    return nearlyEqual(x.re, y.re, epsilon) && nearlyEqual(x.im, y.im, epsilon);
  }

  // node_modules/mathjs/lib/esm/function/relational/equalScalar.js
  var name8 = "equalScalar";
  var dependencies9 = ["typed", "config"];
  var createEqualScalar = /* @__PURE__ */ factory(name8, dependencies9, (_ref) => {
    var {
      typed: typed2,
      config: config5
    } = _ref;
    return typed2(name8, {
      "boolean, boolean": function booleanBoolean(x, y) {
        return x === y;
      },
      "number, number": function numberNumber2(x, y) {
        return nearlyEqual(x, y, config5.epsilon);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.eq(y) || nearlyEqual2(x, y, config5.epsilon);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.equals(y);
      },
      "Complex, Complex": function ComplexComplex(x, y) {
        return complexEquals(x, y, config5.epsilon);
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (!x.equalBase(y)) {
          throw new Error("Cannot compare units with different base");
        }
        return this(x.value, y.value);
      }
    });
  });
  var createEqualScalarNumber = factory(name8, ["typed", "config"], (_ref2) => {
    var {
      typed: typed2,
      config: config5
    } = _ref2;
    return typed2(name8, {
      "number, number": function numberNumber2(x, y) {
        return nearlyEqual(x, y, config5.epsilon);
      }
    });
  });

  // node_modules/mathjs/lib/esm/type/matrix/SparseMatrix.js
  var name9 = "SparseMatrix";
  var dependencies10 = ["typed", "equalScalar", "Matrix"];
  var createSparseMatrixClass = /* @__PURE__ */ factory(name9, dependencies10, (_ref) => {
    var {
      typed: typed2,
      equalScalar: equalScalar2,
      Matrix: Matrix2
    } = _ref;
    function SparseMatrix2(data, datatype) {
      if (!(this instanceof SparseMatrix2)) {
        throw new SyntaxError("Constructor must be called with the new operator");
      }
      if (datatype && !isString(datatype)) {
        throw new Error("Invalid datatype: " + datatype);
      }
      if (isMatrix(data)) {
        _createFromMatrix(this, data, datatype);
      } else if (data && isArray(data.index) && isArray(data.ptr) && isArray(data.size)) {
        this._values = data.values;
        this._index = data.index;
        this._ptr = data.ptr;
        this._size = data.size;
        this._datatype = datatype || data.datatype;
      } else if (isArray(data)) {
        _createFromArray(this, data, datatype);
      } else if (data) {
        throw new TypeError("Unsupported type of data (" + typeOf(data) + ")");
      } else {
        this._values = [];
        this._index = [];
        this._ptr = [0];
        this._size = [0, 0];
        this._datatype = datatype;
      }
    }
    function _createFromMatrix(matrix2, source, datatype) {
      if (source.type === "SparseMatrix") {
        matrix2._values = source._values ? clone(source._values) : void 0;
        matrix2._index = clone(source._index);
        matrix2._ptr = clone(source._ptr);
        matrix2._size = clone(source._size);
        matrix2._datatype = datatype || source._datatype;
      } else {
        _createFromArray(matrix2, source.valueOf(), datatype || source._datatype);
      }
    }
    function _createFromArray(matrix2, data, datatype) {
      matrix2._values = [];
      matrix2._index = [];
      matrix2._ptr = [];
      matrix2._datatype = datatype;
      var rows = data.length;
      var columns = 0;
      var eq = equalScalar2;
      var zero = 0;
      if (isString(datatype)) {
        eq = typed2.find(equalScalar2, [datatype, datatype]) || equalScalar2;
        zero = typed2.convert(0, datatype);
      }
      if (rows > 0) {
        var j = 0;
        do {
          matrix2._ptr.push(matrix2._index.length);
          for (var i = 0; i < rows; i++) {
            var row = data[i];
            if (isArray(row)) {
              if (j === 0 && columns < row.length) {
                columns = row.length;
              }
              if (j < row.length) {
                var v = row[j];
                if (!eq(v, zero)) {
                  matrix2._values.push(v);
                  matrix2._index.push(i);
                }
              }
            } else {
              if (j === 0 && columns < 1) {
                columns = 1;
              }
              if (!eq(row, zero)) {
                matrix2._values.push(row);
                matrix2._index.push(i);
              }
            }
          }
          j++;
        } while (j < columns);
      }
      matrix2._ptr.push(matrix2._index.length);
      matrix2._size = [rows, columns];
    }
    SparseMatrix2.prototype = new Matrix2();
    SparseMatrix2.prototype.createSparseMatrix = function(data, datatype) {
      return new SparseMatrix2(data, datatype);
    };
    SparseMatrix2.prototype.type = "SparseMatrix";
    SparseMatrix2.prototype.isSparseMatrix = true;
    SparseMatrix2.prototype.getDataType = function() {
      return getArrayDataType(this._values, typeOf);
    };
    SparseMatrix2.prototype.storage = function() {
      return "sparse";
    };
    SparseMatrix2.prototype.datatype = function() {
      return this._datatype;
    };
    SparseMatrix2.prototype.create = function(data, datatype) {
      return new SparseMatrix2(data, datatype);
    };
    SparseMatrix2.prototype.density = function() {
      var rows = this._size[0];
      var columns = this._size[1];
      return rows !== 0 && columns !== 0 ? this._index.length / (rows * columns) : 0;
    };
    SparseMatrix2.prototype.subset = function(index, replacement, defaultValue) {
      if (!this._values) {
        throw new Error("Cannot invoke subset on a Pattern only matrix");
      }
      switch (arguments.length) {
        case 1:
          return _getsubset(this, index);
        case 2:
        case 3:
          return _setsubset(this, index, replacement, defaultValue);
        default:
          throw new SyntaxError("Wrong number of arguments");
      }
    };
    function _getsubset(matrix2, idx) {
      if (!isIndex(idx)) {
        throw new TypeError("Invalid index");
      }
      var isScalar = idx.isScalar();
      if (isScalar) {
        return matrix2.get(idx.min());
      }
      var size2 = idx.size();
      if (size2.length !== matrix2._size.length) {
        throw new DimensionError(size2.length, matrix2._size.length);
      }
      var i, ii, k, kk;
      var min2 = idx.min();
      var max2 = idx.max();
      for (i = 0, ii = matrix2._size.length; i < ii; i++) {
        validateIndex(min2[i], matrix2._size[i]);
        validateIndex(max2[i], matrix2._size[i]);
      }
      var mvalues = matrix2._values;
      var mindex = matrix2._index;
      var mptr = matrix2._ptr;
      var rows = idx.dimension(0);
      var columns = idx.dimension(1);
      var w = [];
      var pv = [];
      rows.forEach(function(i2, r) {
        pv[i2] = r[0];
        w[i2] = true;
      });
      var values = mvalues ? [] : void 0;
      var index = [];
      var ptr = [];
      columns.forEach(function(j) {
        ptr.push(index.length);
        for (k = mptr[j], kk = mptr[j + 1]; k < kk; k++) {
          i = mindex[k];
          if (w[i] === true) {
            index.push(pv[i]);
            if (values) {
              values.push(mvalues[k]);
            }
          }
        }
      });
      ptr.push(index.length);
      return new SparseMatrix2({
        values,
        index,
        ptr,
        size: size2,
        datatype: matrix2._datatype
      });
    }
    function _setsubset(matrix2, index, submatrix, defaultValue) {
      if (!index || index.isIndex !== true) {
        throw new TypeError("Invalid index");
      }
      var iSize = index.size();
      var isScalar = index.isScalar();
      var sSize;
      if (isMatrix(submatrix)) {
        sSize = submatrix.size();
        submatrix = submatrix.toArray();
      } else {
        sSize = arraySize(submatrix);
      }
      if (isScalar) {
        if (sSize.length !== 0) {
          throw new TypeError("Scalar expected");
        }
        matrix2.set(index.min(), submatrix, defaultValue);
      } else {
        if (iSize.length !== 1 && iSize.length !== 2) {
          throw new DimensionError(iSize.length, matrix2._size.length, "<");
        }
        if (sSize.length < iSize.length) {
          var i = 0;
          var outer = 0;
          while (iSize[i] === 1 && sSize[i] === 1) {
            i++;
          }
          while (iSize[i] === 1) {
            outer++;
            i++;
          }
          submatrix = unsqueeze(submatrix, iSize.length, outer, sSize);
        }
        if (!deepStrictEqual(iSize, sSize)) {
          throw new DimensionError(iSize, sSize, ">");
        }
        var x0 = index.min()[0];
        var y0 = index.min()[1];
        var m = sSize[0];
        var n = sSize[1];
        for (var x = 0; x < m; x++) {
          for (var y = 0; y < n; y++) {
            var v = submatrix[x][y];
            matrix2.set([x + x0, y + y0], v, defaultValue);
          }
        }
      }
      return matrix2;
    }
    SparseMatrix2.prototype.get = function(index) {
      if (!isArray(index)) {
        throw new TypeError("Array expected");
      }
      if (index.length !== this._size.length) {
        throw new DimensionError(index.length, this._size.length);
      }
      if (!this._values) {
        throw new Error("Cannot invoke get on a Pattern only matrix");
      }
      var i = index[0];
      var j = index[1];
      validateIndex(i, this._size[0]);
      validateIndex(j, this._size[1]);
      var k = _getValueIndex(i, this._ptr[j], this._ptr[j + 1], this._index);
      if (k < this._ptr[j + 1] && this._index[k] === i) {
        return this._values[k];
      }
      return 0;
    };
    SparseMatrix2.prototype.set = function(index, v, defaultValue) {
      if (!isArray(index)) {
        throw new TypeError("Array expected");
      }
      if (index.length !== this._size.length) {
        throw new DimensionError(index.length, this._size.length);
      }
      if (!this._values) {
        throw new Error("Cannot invoke set on a Pattern only matrix");
      }
      var i = index[0];
      var j = index[1];
      var rows = this._size[0];
      var columns = this._size[1];
      var eq = equalScalar2;
      var zero = 0;
      if (isString(this._datatype)) {
        eq = typed2.find(equalScalar2, [this._datatype, this._datatype]) || equalScalar2;
        zero = typed2.convert(0, this._datatype);
      }
      if (i > rows - 1 || j > columns - 1) {
        _resize2(this, Math.max(i + 1, rows), Math.max(j + 1, columns), defaultValue);
        rows = this._size[0];
        columns = this._size[1];
      }
      validateIndex(i, rows);
      validateIndex(j, columns);
      var k = _getValueIndex(i, this._ptr[j], this._ptr[j + 1], this._index);
      if (k < this._ptr[j + 1] && this._index[k] === i) {
        if (!eq(v, zero)) {
          this._values[k] = v;
        } else {
          _remove(k, j, this._values, this._index, this._ptr);
        }
      } else {
        _insert(k, i, j, v, this._values, this._index, this._ptr);
      }
      return this;
    };
    function _getValueIndex(i, top, bottom, index) {
      if (bottom - top === 0) {
        return bottom;
      }
      for (var r = top; r < bottom; r++) {
        if (index[r] === i) {
          return r;
        }
      }
      return top;
    }
    function _remove(k, j, values, index, ptr) {
      values.splice(k, 1);
      index.splice(k, 1);
      for (var x = j + 1; x < ptr.length; x++) {
        ptr[x]--;
      }
    }
    function _insert(k, i, j, v, values, index, ptr) {
      values.splice(k, 0, v);
      index.splice(k, 0, i);
      for (var x = j + 1; x < ptr.length; x++) {
        ptr[x]++;
      }
    }
    SparseMatrix2.prototype.resize = function(size2, defaultValue, copy) {
      if (!isCollection(size2)) {
        throw new TypeError("Array or Matrix expected");
      }
      var sizeArray = size2.valueOf().map((value) => {
        return Array.isArray(value) && value.length === 1 ? value[0] : value;
      });
      if (sizeArray.length !== 2) {
        throw new Error("Only two dimensions matrix are supported");
      }
      sizeArray.forEach(function(value) {
        if (!isNumber(value) || !isInteger(value) || value < 0) {
          throw new TypeError("Invalid size, must contain positive integers (size: " + format3(sizeArray) + ")");
        }
      });
      var m = copy ? this.clone() : this;
      return _resize2(m, sizeArray[0], sizeArray[1], defaultValue);
    };
    function _resize2(matrix2, rows, columns, defaultValue) {
      var value = defaultValue || 0;
      var eq = equalScalar2;
      var zero = 0;
      if (isString(matrix2._datatype)) {
        eq = typed2.find(equalScalar2, [matrix2._datatype, matrix2._datatype]) || equalScalar2;
        zero = typed2.convert(0, matrix2._datatype);
        value = typed2.convert(value, matrix2._datatype);
      }
      var ins = !eq(value, zero);
      var r = matrix2._size[0];
      var c = matrix2._size[1];
      var i, j, k;
      if (columns > c) {
        for (j = c; j < columns; j++) {
          matrix2._ptr[j] = matrix2._values.length;
          if (ins) {
            for (i = 0; i < r; i++) {
              matrix2._values.push(value);
              matrix2._index.push(i);
            }
          }
        }
        matrix2._ptr[columns] = matrix2._values.length;
      } else if (columns < c) {
        matrix2._ptr.splice(columns + 1, c - columns);
        matrix2._values.splice(matrix2._ptr[columns], matrix2._values.length);
        matrix2._index.splice(matrix2._ptr[columns], matrix2._index.length);
      }
      c = columns;
      if (rows > r) {
        if (ins) {
          var n = 0;
          for (j = 0; j < c; j++) {
            matrix2._ptr[j] = matrix2._ptr[j] + n;
            k = matrix2._ptr[j + 1] + n;
            var p = 0;
            for (i = r; i < rows; i++, p++) {
              matrix2._values.splice(k + p, 0, value);
              matrix2._index.splice(k + p, 0, i);
              n++;
            }
          }
          matrix2._ptr[c] = matrix2._values.length;
        }
      } else if (rows < r) {
        var d = 0;
        for (j = 0; j < c; j++) {
          matrix2._ptr[j] = matrix2._ptr[j] - d;
          var k0 = matrix2._ptr[j];
          var k1 = matrix2._ptr[j + 1] - d;
          for (k = k0; k < k1; k++) {
            i = matrix2._index[k];
            if (i > rows - 1) {
              matrix2._values.splice(k, 1);
              matrix2._index.splice(k, 1);
              d++;
            }
          }
        }
        matrix2._ptr[j] = matrix2._values.length;
      }
      matrix2._size[0] = rows;
      matrix2._size[1] = columns;
      return matrix2;
    }
    SparseMatrix2.prototype.reshape = function(size2, copy) {
      if (!isArray(size2)) {
        throw new TypeError("Array expected");
      }
      if (size2.length !== 2) {
        throw new Error("Sparse matrices can only be reshaped in two dimensions");
      }
      size2.forEach(function(value) {
        if (!isNumber(value) || !isInteger(value) || value < 0) {
          throw new TypeError("Invalid size, must contain positive integers (size: " + format3(size2) + ")");
        }
      });
      if (this._size[0] * this._size[1] !== size2[0] * size2[1]) {
        throw new Error("Reshaping sparse matrix will result in the wrong number of elements");
      }
      var m = copy ? this.clone() : this;
      if (this._size[0] === size2[0] && this._size[1] === size2[1]) {
        return m;
      }
      var colIndex = [];
      for (var i = 0; i < m._ptr.length; i++) {
        for (var j = 0; j < m._ptr[i + 1] - m._ptr[i]; j++) {
          colIndex.push(i);
        }
      }
      var values = m._values.slice();
      var rowIndex = m._index.slice();
      for (var _i = 0; _i < m._index.length; _i++) {
        var r1 = rowIndex[_i];
        var c1 = colIndex[_i];
        var flat = r1 * m._size[1] + c1;
        colIndex[_i] = flat % size2[1];
        rowIndex[_i] = Math.floor(flat / size2[1]);
      }
      m._values.length = 0;
      m._index.length = 0;
      m._ptr.length = size2[1] + 1;
      m._size = size2.slice();
      for (var _i2 = 0; _i2 < m._ptr.length; _i2++) {
        m._ptr[_i2] = 0;
      }
      for (var h = 0; h < values.length; h++) {
        var _i3 = rowIndex[h];
        var _j = colIndex[h];
        var v = values[h];
        var k = _getValueIndex(_i3, m._ptr[_j], m._ptr[_j + 1], m._index);
        _insert(k, _i3, _j, v, m._values, m._index, m._ptr);
      }
      return m;
    };
    SparseMatrix2.prototype.clone = function() {
      var m = new SparseMatrix2({
        values: this._values ? clone(this._values) : void 0,
        index: clone(this._index),
        ptr: clone(this._ptr),
        size: clone(this._size),
        datatype: this._datatype
      });
      return m;
    };
    SparseMatrix2.prototype.size = function() {
      return this._size.slice(0);
    };
    SparseMatrix2.prototype.map = function(callback, skipZeros) {
      if (!this._values) {
        throw new Error("Cannot invoke map on a Pattern only matrix");
      }
      var me = this;
      var rows = this._size[0];
      var columns = this._size[1];
      var invoke = function invoke2(v, i, j) {
        return callback(v, [i, j], me);
      };
      return _map(this, 0, rows - 1, 0, columns - 1, invoke, skipZeros);
    };
    function _map(matrix2, minRow, maxRow, minColumn, maxColumn, callback, skipZeros) {
      var values = [];
      var index = [];
      var ptr = [];
      var eq = equalScalar2;
      var zero = 0;
      if (isString(matrix2._datatype)) {
        eq = typed2.find(equalScalar2, [matrix2._datatype, matrix2._datatype]) || equalScalar2;
        zero = typed2.convert(0, matrix2._datatype);
      }
      var invoke = function invoke2(v, x, y) {
        v = callback(v, x, y);
        if (!eq(v, zero)) {
          values.push(v);
          index.push(x);
        }
      };
      for (var j = minColumn; j <= maxColumn; j++) {
        ptr.push(values.length);
        var k0 = matrix2._ptr[j];
        var k1 = matrix2._ptr[j + 1];
        if (skipZeros) {
          for (var k = k0; k < k1; k++) {
            var i = matrix2._index[k];
            if (i >= minRow && i <= maxRow) {
              invoke(matrix2._values[k], i - minRow, j - minColumn);
            }
          }
        } else {
          var _values = {};
          for (var _k = k0; _k < k1; _k++) {
            var _i4 = matrix2._index[_k];
            _values[_i4] = matrix2._values[_k];
          }
          for (var _i5 = minRow; _i5 <= maxRow; _i5++) {
            var value = _i5 in _values ? _values[_i5] : 0;
            invoke(value, _i5 - minRow, j - minColumn);
          }
        }
      }
      ptr.push(values.length);
      return new SparseMatrix2({
        values,
        index,
        ptr,
        size: [maxRow - minRow + 1, maxColumn - minColumn + 1]
      });
    }
    SparseMatrix2.prototype.forEach = function(callback, skipZeros) {
      if (!this._values) {
        throw new Error("Cannot invoke forEach on a Pattern only matrix");
      }
      var me = this;
      var rows = this._size[0];
      var columns = this._size[1];
      for (var j = 0; j < columns; j++) {
        var k0 = this._ptr[j];
        var k1 = this._ptr[j + 1];
        if (skipZeros) {
          for (var k = k0; k < k1; k++) {
            var i = this._index[k];
            callback(this._values[k], [i, j], me);
          }
        } else {
          var values = {};
          for (var _k2 = k0; _k2 < k1; _k2++) {
            var _i6 = this._index[_k2];
            values[_i6] = this._values[_k2];
          }
          for (var _i7 = 0; _i7 < rows; _i7++) {
            var value = _i7 in values ? values[_i7] : 0;
            callback(value, [_i7, j], me);
          }
        }
      }
    };
    SparseMatrix2.prototype.toArray = function() {
      return _toArray(this._values, this._index, this._ptr, this._size, true);
    };
    SparseMatrix2.prototype.valueOf = function() {
      return _toArray(this._values, this._index, this._ptr, this._size, false);
    };
    function _toArray(values, index, ptr, size2, copy) {
      var rows = size2[0];
      var columns = size2[1];
      var a = [];
      var i, j;
      for (i = 0; i < rows; i++) {
        a[i] = [];
        for (j = 0; j < columns; j++) {
          a[i][j] = 0;
        }
      }
      for (j = 0; j < columns; j++) {
        var k0 = ptr[j];
        var k1 = ptr[j + 1];
        for (var k = k0; k < k1; k++) {
          i = index[k];
          a[i][j] = values ? copy ? clone(values[k]) : values[k] : 1;
        }
      }
      return a;
    }
    SparseMatrix2.prototype.format = function(options) {
      var rows = this._size[0];
      var columns = this._size[1];
      var density = this.density();
      var str = "Sparse Matrix [" + format3(rows, options) + " x " + format3(columns, options) + "] density: " + format3(density, options) + "\n";
      for (var j = 0; j < columns; j++) {
        var k0 = this._ptr[j];
        var k1 = this._ptr[j + 1];
        for (var k = k0; k < k1; k++) {
          var i = this._index[k];
          str += "\n    (" + format3(i, options) + ", " + format3(j, options) + ") ==> " + (this._values ? format3(this._values[k], options) : "X");
        }
      }
      return str;
    };
    SparseMatrix2.prototype.toString = function() {
      return format3(this.toArray());
    };
    SparseMatrix2.prototype.toJSON = function() {
      return {
        mathjs: "SparseMatrix",
        values: this._values,
        index: this._index,
        ptr: this._ptr,
        size: this._size,
        datatype: this._datatype
      };
    };
    SparseMatrix2.prototype.diagonal = function(k) {
      if (k) {
        if (isBigNumber(k)) {
          k = k.toNumber();
        }
        if (!isNumber(k) || !isInteger(k)) {
          throw new TypeError("The parameter k must be an integer number");
        }
      } else {
        k = 0;
      }
      var kSuper = k > 0 ? k : 0;
      var kSub = k < 0 ? -k : 0;
      var rows = this._size[0];
      var columns = this._size[1];
      var n = Math.min(rows - kSub, columns - kSuper);
      var values = [];
      var index = [];
      var ptr = [];
      ptr[0] = 0;
      for (var j = kSuper; j < columns && values.length < n; j++) {
        var k0 = this._ptr[j];
        var k1 = this._ptr[j + 1];
        for (var x = k0; x < k1; x++) {
          var i = this._index[x];
          if (i === j - kSuper + kSub) {
            values.push(this._values[x]);
            index[values.length - 1] = i - kSub;
            break;
          }
        }
      }
      ptr.push(values.length);
      return new SparseMatrix2({
        values,
        index,
        ptr,
        size: [n, 1]
      });
    };
    SparseMatrix2.fromJSON = function(json) {
      return new SparseMatrix2(json);
    };
    SparseMatrix2.diagonal = function(size2, value, k, defaultValue, datatype) {
      if (!isArray(size2)) {
        throw new TypeError("Array expected, size parameter");
      }
      if (size2.length !== 2) {
        throw new Error("Only two dimensions matrix are supported");
      }
      size2 = size2.map(function(s) {
        if (isBigNumber(s)) {
          s = s.toNumber();
        }
        if (!isNumber(s) || !isInteger(s) || s < 1) {
          throw new Error("Size values must be positive integers");
        }
        return s;
      });
      if (k) {
        if (isBigNumber(k)) {
          k = k.toNumber();
        }
        if (!isNumber(k) || !isInteger(k)) {
          throw new TypeError("The parameter k must be an integer number");
        }
      } else {
        k = 0;
      }
      var eq = equalScalar2;
      var zero = 0;
      if (isString(datatype)) {
        eq = typed2.find(equalScalar2, [datatype, datatype]) || equalScalar2;
        zero = typed2.convert(0, datatype);
      }
      var kSuper = k > 0 ? k : 0;
      var kSub = k < 0 ? -k : 0;
      var rows = size2[0];
      var columns = size2[1];
      var n = Math.min(rows - kSub, columns - kSuper);
      var _value;
      if (isArray(value)) {
        if (value.length !== n) {
          throw new Error("Invalid value array length");
        }
        _value = function _value2(i2) {
          return value[i2];
        };
      } else if (isMatrix(value)) {
        var ms = value.size();
        if (ms.length !== 1 || ms[0] !== n) {
          throw new Error("Invalid matrix length");
        }
        _value = function _value2(i2) {
          return value.get([i2]);
        };
      } else {
        _value = function _value2() {
          return value;
        };
      }
      var values = [];
      var index = [];
      var ptr = [];
      for (var j = 0; j < columns; j++) {
        ptr.push(values.length);
        var i = j - kSuper;
        if (i >= 0 && i < n) {
          var v = _value(i);
          if (!eq(v, zero)) {
            index.push(i + kSub);
            values.push(v);
          }
        }
      }
      ptr.push(values.length);
      return new SparseMatrix2({
        values,
        index,
        ptr,
        size: [rows, columns]
      });
    };
    SparseMatrix2.prototype.swapRows = function(i, j) {
      if (!isNumber(i) || !isInteger(i) || !isNumber(j) || !isInteger(j)) {
        throw new Error("Row index must be positive integers");
      }
      if (this._size.length !== 2) {
        throw new Error("Only two dimensional matrix is supported");
      }
      validateIndex(i, this._size[0]);
      validateIndex(j, this._size[0]);
      SparseMatrix2._swapRows(i, j, this._size[1], this._values, this._index, this._ptr);
      return this;
    };
    SparseMatrix2._forEachRow = function(j, values, index, ptr, callback) {
      var k0 = ptr[j];
      var k1 = ptr[j + 1];
      for (var k = k0; k < k1; k++) {
        callback(index[k], values[k]);
      }
    };
    SparseMatrix2._swapRows = function(x, y, columns, values, index, ptr) {
      for (var j = 0; j < columns; j++) {
        var k0 = ptr[j];
        var k1 = ptr[j + 1];
        var kx = _getValueIndex(x, k0, k1, index);
        var ky = _getValueIndex(y, k0, k1, index);
        if (kx < k1 && ky < k1 && index[kx] === x && index[ky] === y) {
          if (values) {
            var v = values[kx];
            values[kx] = values[ky];
            values[ky] = v;
          }
          continue;
        }
        if (kx < k1 && index[kx] === x && (ky >= k1 || index[ky] !== y)) {
          var vx = values ? values[kx] : void 0;
          index.splice(ky, 0, y);
          if (values) {
            values.splice(ky, 0, vx);
          }
          index.splice(ky <= kx ? kx + 1 : kx, 1);
          if (values) {
            values.splice(ky <= kx ? kx + 1 : kx, 1);
          }
          continue;
        }
        if (ky < k1 && index[ky] === y && (kx >= k1 || index[kx] !== x)) {
          var vy = values ? values[ky] : void 0;
          index.splice(kx, 0, x);
          if (values) {
            values.splice(kx, 0, vy);
          }
          index.splice(kx <= ky ? ky + 1 : ky, 1);
          if (values) {
            values.splice(kx <= ky ? ky + 1 : ky, 1);
          }
        }
      }
    };
    return SparseMatrix2;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/type/number.js
  var name10 = "number";
  var dependencies11 = ["typed"];
  var createNumber = /* @__PURE__ */ factory(name10, dependencies11, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    var number50 = typed2("number", {
      "": function _() {
        return 0;
      },
      number: function number51(x) {
        return x;
      },
      string: function string11(x) {
        if (x === "NaN")
          return NaN;
        var num = Number(x);
        if (isNaN(num)) {
          throw new SyntaxError('String "' + x + '" is no valid number');
        }
        if (["0b", "0o", "0x"].includes(x.substring(0, 2))) {
          if (num > 2 ** 32 - 1) {
            throw new SyntaxError('String "'.concat(x, '" is out of range'));
          }
          if (num & 2147483648) {
            num = -1 * ~(num - 1);
          }
        }
        return num;
      },
      BigNumber: function BigNumber2(x) {
        return x.toNumber();
      },
      Fraction: function Fraction3(x) {
        return x.valueOf();
      },
      Unit: function Unit2(x) {
        throw new Error("Second argument with valueless unit expected");
      },
      null: function _null(x) {
        return 0;
      },
      "Unit, string | Unit": function UnitStringUnit(unit, valuelessUnit) {
        return unit.toNumber(valuelessUnit);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
    number50.fromJSON = function(json) {
      return parseFloat(json.value);
    };
    return number50;
  });

  // node_modules/mathjs/lib/esm/type/bignumber/function/bignumber.js
  var name11 = "bignumber";
  var dependencies12 = ["typed", "BigNumber"];
  var createBignumber = /* @__PURE__ */ factory(name11, dependencies12, (_ref) => {
    var {
      typed: typed2,
      BigNumber: BigNumber2
    } = _ref;
    return typed2("bignumber", {
      "": function _() {
        return new BigNumber2(0);
      },
      number: function number50(x) {
        return new BigNumber2(x + "");
      },
      string: function string11(x) {
        return new BigNumber2(x);
      },
      BigNumber: function BigNumber3(x) {
        return x;
      },
      Fraction: function Fraction3(x) {
        return new BigNumber2(x.n).div(x.d).times(x.s);
      },
      null: function _null(x) {
        return new BigNumber2(0);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/type/fraction/function/fraction.js
  var name12 = "fraction";
  var dependencies13 = ["typed", "Fraction"];
  var createFraction = /* @__PURE__ */ factory(name12, dependencies13, (_ref) => {
    var {
      typed: typed2,
      Fraction: Fraction3
    } = _ref;
    return typed2("fraction", {
      number: function number50(x) {
        if (!isFinite(x) || isNaN(x)) {
          throw new Error(x + " cannot be represented as a fraction");
        }
        return new Fraction3(x);
      },
      string: function string11(x) {
        return new Fraction3(x);
      },
      "number, number": function numberNumber2(numerator, denominator) {
        return new Fraction3(numerator, denominator);
      },
      null: function _null(x) {
        return new Fraction3(0);
      },
      BigNumber: function BigNumber2(x) {
        return new Fraction3(x.toString());
      },
      Fraction: function Fraction4(x) {
        return x;
      },
      Object: function Object2(x) {
        return new Fraction3(x);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/type/matrix/function/matrix.js
  var name13 = "matrix";
  var dependencies14 = ["typed", "Matrix", "DenseMatrix", "SparseMatrix"];
  var createMatrix = /* @__PURE__ */ factory(name13, dependencies14, (_ref) => {
    var {
      typed: typed2,
      Matrix: Matrix2,
      DenseMatrix: DenseMatrix2,
      SparseMatrix: SparseMatrix2
    } = _ref;
    return typed2(name13, {
      "": function _() {
        return _create([]);
      },
      string: function string11(format5) {
        return _create([], format5);
      },
      "string, string": function stringString(format5, datatype) {
        return _create([], format5, datatype);
      },
      Array: function Array2(data) {
        return _create(data);
      },
      Matrix: function Matrix3(data) {
        return _create(data, data.storage());
      },
      "Array | Matrix, string": _create,
      "Array | Matrix, string, string": _create
    });
    function _create(data, format5, datatype) {
      if (format5 === "dense" || format5 === "default" || format5 === void 0) {
        return new DenseMatrix2(data, datatype);
      }
      if (format5 === "sparse") {
        return new SparseMatrix2(data, datatype);
      }
      throw new TypeError("Unknown matrix type " + JSON.stringify(format5) + ".");
    }
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/unaryMinus.js
  var name14 = "unaryMinus";
  var dependencies15 = ["typed"];
  var createUnaryMinus = /* @__PURE__ */ factory(name14, dependencies15, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name14, {
      number: unaryMinusNumber,
      Complex: function Complex3(x) {
        return x.neg();
      },
      BigNumber: function BigNumber2(x) {
        return x.neg();
      },
      Fraction: function Fraction3(x) {
        return x.neg();
      },
      Unit: function Unit2(x) {
        var res = x.clone();
        res.value = this(x.value);
        return res;
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/unaryPlus.js
  var name15 = "unaryPlus";
  var dependencies16 = ["typed", "config", "BigNumber"];
  var createUnaryPlus = /* @__PURE__ */ factory(name15, dependencies16, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      BigNumber: BigNumber2
    } = _ref;
    return typed2(name15, {
      number: unaryPlusNumber,
      Complex: function Complex3(x) {
        return x;
      },
      BigNumber: function BigNumber3(x) {
        return x;
      },
      Fraction: function Fraction3(x) {
        return x;
      },
      Unit: function Unit2(x) {
        return x.clone();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      },
      "boolean | string": function booleanString(x) {
        return config5.number === "BigNumber" ? new BigNumber2(+x) : +x;
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/abs.js
  var name16 = "abs";
  var dependencies17 = ["typed"];
  var createAbs = /* @__PURE__ */ factory(name16, dependencies17, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name16, {
      number: absNumber,
      Complex: function Complex3(x) {
        return x.abs();
      },
      BigNumber: function BigNumber2(x) {
        return x.abs();
      },
      Fraction: function Fraction3(x) {
        return x.abs();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      },
      Unit: function Unit2(x) {
        return x.abs();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/addScalar.js
  var name17 = "addScalar";
  var dependencies18 = ["typed"];
  var createAddScalar = /* @__PURE__ */ factory(name17, dependencies18, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name17, {
      "number, number": addNumber,
      "Complex, Complex": function ComplexComplex(x, y) {
        return x.add(y);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.plus(y);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.add(y);
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (x.value === null || x.value === void 0)
          throw new Error("Parameter x contains a unit with undefined value");
        if (y.value === null || y.value === void 0)
          throw new Error("Parameter y contains a unit with undefined value");
        if (!x.equalBase(y))
          throw new Error("Units do not match");
        var res = x.clone();
        res.value = this(res.value, y.value);
        res.fixPrefix = false;
        return res;
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/cbrt.js
  var name18 = "cbrt";
  var dependencies19 = ["config", "typed", "isNegative", "unaryMinus", "matrix", "Complex", "BigNumber", "Fraction"];
  var createCbrt = /* @__PURE__ */ factory(name18, dependencies19, (_ref) => {
    var {
      config: config5,
      typed: typed2,
      isNegative: isNegative2,
      unaryMinus: unaryMinus2,
      matrix: matrix2,
      Complex: Complex3,
      BigNumber: BigNumber2,
      Fraction: Fraction3
    } = _ref;
    return typed2(name18, {
      number: cbrtNumber,
      Complex: _cbrtComplex,
      "Complex, boolean": _cbrtComplex,
      BigNumber: function BigNumber3(x) {
        return x.cbrt();
      },
      Unit: _cbrtUnit,
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      }
    });
    function _cbrtComplex(x, allRoots) {
      var arg3 = x.arg() / 3;
      var abs2 = x.abs();
      var principal = new Complex3(cbrtNumber(abs2), 0).mul(new Complex3(0, arg3).exp());
      if (allRoots) {
        var all = [principal, new Complex3(cbrtNumber(abs2), 0).mul(new Complex3(0, arg3 + Math.PI * 2 / 3).exp()), new Complex3(cbrtNumber(abs2), 0).mul(new Complex3(0, arg3 - Math.PI * 2 / 3).exp())];
        return config5.matrix === "Array" ? all : matrix2(all);
      } else {
        return principal;
      }
    }
    function _cbrtUnit(x) {
      if (x.value && isComplex(x.value)) {
        var result = x.clone();
        result.value = 1;
        result = result.pow(1 / 3);
        result.value = _cbrtComplex(x.value);
        return result;
      } else {
        var negate = isNegative2(x.value);
        if (negate) {
          x.value = unaryMinus2(x.value);
        }
        var third;
        if (isBigNumber(x.value)) {
          third = new BigNumber2(1).div(3);
        } else if (isFraction(x.value)) {
          third = new Fraction3(1, 3);
        } else {
          third = 1 / 3;
        }
        var _result = x.pow(third);
        if (negate) {
          _result.value = unaryMinus2(_result.value);
        }
        return _result;
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/ceil.js
  const decimal2 = __toModule(require_decimal());

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm11.js
  var name19 = "algorithm11";
  var dependencies20 = ["typed", "equalScalar"];
  var createAlgorithm11 = /* @__PURE__ */ factory(name19, dependencies20, (_ref) => {
    var {
      typed: typed2,
      equalScalar: equalScalar2
    } = _ref;
    return function algorithm115(s, b, callback, inverse) {
      var avalues = s._values;
      var aindex = s._index;
      var aptr = s._ptr;
      var asize = s._size;
      var adt = s._datatype;
      if (!avalues) {
        throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt;
      var eq = equalScalar2;
      var zero = 0;
      var cf = callback;
      if (typeof adt === "string") {
        dt = adt;
        eq = typed2.find(equalScalar2, [dt, dt]);
        zero = typed2.convert(0, dt);
        b = typed2.convert(b, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var cvalues = [];
      var cindex = [];
      var cptr = [];
      for (var j = 0; j < columns; j++) {
        cptr[j] = cindex.length;
        for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
          var i = aindex[k];
          var v = inverse ? cf(b, avalues[k]) : cf(avalues[k], b);
          if (!eq(v, zero)) {
            cindex.push(i);
            cvalues.push(v);
          }
        }
      }
      cptr[columns] = cindex.length;
      return s.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [rows, columns],
        datatype: dt
      });
    };
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm14.js
  var name20 = "algorithm14";
  var dependencies21 = ["typed"];
  var createAlgorithm14 = /* @__PURE__ */ factory(name20, dependencies21, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return function algorithm1415(a, b, callback, inverse) {
      var adata = a._data;
      var asize = a._size;
      var adt = a._datatype;
      var dt;
      var cf = callback;
      if (typeof adt === "string") {
        dt = adt;
        b = typed2.convert(b, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var cdata = asize.length > 0 ? _iterate(cf, 0, asize, asize[0], adata, b, inverse) : [];
      return a.createDenseMatrix({
        data: cdata,
        size: clone(asize),
        datatype: dt
      });
    };
    function _iterate(f, level, s, n, av, bv, inverse) {
      var cv = [];
      if (level === s.length - 1) {
        for (var i = 0; i < n; i++) {
          cv[i] = inverse ? f(bv, av[i]) : f(av[i], bv);
        }
      } else {
        for (var j = 0; j < n; j++) {
          cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv, inverse);
        }
      }
      return cv;
    }
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/ceil.js
  var name21 = "ceil";
  var dependencies22 = ["typed", "config", "round", "matrix", "equalScalar"];
  var createCeil = /* @__PURE__ */ factory(name21, dependencies22, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      round: round2,
      matrix: matrix2,
      equalScalar: equalScalar2
    } = _ref;
    var algorithm115 = createAlgorithm11({
      typed: typed2,
      equalScalar: equalScalar2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2("ceil", {
      number: function number50(x) {
        if (nearlyEqual(x, round2(x), config5.epsilon)) {
          return round2(x);
        } else {
          return ceilNumber(x);
        }
      },
      "number, number": function numberNumber2(x, n) {
        if (nearlyEqual(x, round2(x, n), config5.epsilon)) {
          return round2(x, n);
        } else {
          var [number50, exponent] = "".concat(x, "e").split("e");
          var result = Math.ceil(Number("".concat(number50, "e").concat(Number(exponent) + n)));
          [number50, exponent] = "".concat(result, "e").split("e");
          return Number("".concat(number50, "e").concat(Number(exponent) - n));
        }
      },
      Complex: function Complex3(x) {
        return x.ceil();
      },
      "Complex, number": function ComplexNumber(x, n) {
        return x.ceil(n);
      },
      BigNumber: function BigNumber2(x) {
        if (nearlyEqual2(x, round2(x), config5.epsilon)) {
          return round2(x);
        } else {
          return x.ceil();
        }
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, n) {
        if (nearlyEqual2(x, round2(x, n), config5.epsilon)) {
          return round2(x, n);
        } else {
          return x.toDecimalPlaces(n.toNumber(), decimal2.default.ROUND_CEIL);
        }
      },
      Fraction: function Fraction3(x) {
        return x.ceil();
      },
      "Fraction, number": function FractionNumber(x, n) {
        return x.ceil(n);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      },
      "Array | Matrix, number": function ArrayMatrixNumber(x, n) {
        return deepMap(x, (i) => this(i, n), true);
      },
      "SparseMatrix, number | BigNumber": function SparseMatrixNumberBigNumber(x, y) {
        return algorithm115(x, y, this, false);
      },
      "DenseMatrix, number | BigNumber": function DenseMatrixNumberBigNumber(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/fix.js
  var name22 = "fix";
  var dependencies23 = ["typed", "Complex", "matrix", "ceil", "floor"];
  var createFix = /* @__PURE__ */ factory(name22, dependencies23, (_ref) => {
    var {
      typed: typed2,
      Complex: _Complex,
      matrix: matrix2,
      ceil: ceil2,
      floor: floor2
    } = _ref;
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2("fix", {
      number: function number50(x) {
        return x > 0 ? floor2(x) : ceil2(x);
      },
      "number, number | BigNumber": function numberNumberBigNumber(x, n) {
        return x > 0 ? floor2(x, n) : ceil2(x, n);
      },
      Complex: function Complex3(x) {
        return new _Complex(x.re > 0 ? Math.floor(x.re) : Math.ceil(x.re), x.im > 0 ? Math.floor(x.im) : Math.ceil(x.im));
      },
      "Complex, number | BigNumber": function ComplexNumberBigNumber(x, n) {
        return new _Complex(x.re > 0 ? floor2(x.re, n) : ceil2(x.re, n), x.im > 0 ? floor2(x.im, n) : ceil2(x.im, n));
      },
      BigNumber: function BigNumber2(x) {
        return x.isNegative() ? ceil2(x) : floor2(x);
      },
      "BigNumber, number | BigNumber": function BigNumberNumberBigNumber(x, n) {
        return x.isNegative() ? ceil2(x, n) : floor2(x, n);
      },
      Fraction: function Fraction3(x) {
        return x.s < 0 ? x.ceil() : x.floor();
      },
      "Fraction, number | BigNumber": function FractionNumberBigNumber(x, n) {
        return x.s < 0 ? x.ceil(n) : x.floor(n);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      },
      "Array | Matrix, number | BigNumber": function ArrayMatrixNumberBigNumber(x, n) {
        return deepMap(x, (i) => this(i, n), true);
      },
      "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/floor.js
  const decimal3 = __toModule(require_decimal());
  var name23 = "floor";
  var dependencies24 = ["typed", "config", "round", "matrix", "equalScalar"];
  var createFloor = /* @__PURE__ */ factory(name23, dependencies24, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      round: round2,
      matrix: matrix2,
      equalScalar: equalScalar2
    } = _ref;
    var algorithm115 = createAlgorithm11({
      typed: typed2,
      equalScalar: equalScalar2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2("floor", {
      number: function number50(x) {
        if (nearlyEqual(x, round2(x), config5.epsilon)) {
          return round2(x);
        } else {
          return Math.floor(x);
        }
      },
      "number, number": function numberNumber2(x, n) {
        if (nearlyEqual(x, round2(x, n), config5.epsilon)) {
          return round2(x, n);
        } else {
          var [number50, exponent] = "".concat(x, "e").split("e");
          var result = Math.floor(Number("".concat(number50, "e").concat(Number(exponent) + n)));
          [number50, exponent] = "".concat(result, "e").split("e");
          return Number("".concat(number50, "e").concat(Number(exponent) - n));
        }
      },
      Complex: function Complex3(x) {
        return x.floor();
      },
      "Complex, number": function ComplexNumber(x, n) {
        return x.floor(n);
      },
      BigNumber: function BigNumber2(x) {
        if (nearlyEqual2(x, round2(x), config5.epsilon)) {
          return round2(x);
        } else {
          return x.floor();
        }
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, n) {
        if (nearlyEqual2(x, round2(x, n), config5.epsilon)) {
          return round2(x, n);
        } else {
          return x.toDecimalPlaces(n.toNumber(), decimal3.default.ROUND_FLOOR);
        }
      },
      Fraction: function Fraction3(x) {
        return x.floor();
      },
      "Fraction, number": function FractionNumber(x, n) {
        return x.floor(n);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      },
      "Array | Matrix, number": function ArrayMatrixNumber(x, n) {
        return deepMap(x, (i) => this(i, n), true);
      },
      "SparseMatrix, number | BigNumber": function SparseMatrixNumberBigNumber(x, y) {
        return algorithm115(x, y, this, false);
      },
      "DenseMatrix, number | BigNumber": function DenseMatrixNumberBigNumber(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm01.js
  var name24 = "algorithm01";
  var dependencies25 = ["typed"];
  var createAlgorithm01 = /* @__PURE__ */ factory(name24, dependencies25, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return function algorithm1(denseMatrix, sparseMatrix, callback, inverse) {
      var adata = denseMatrix._data;
      var asize = denseMatrix._size;
      var adt = denseMatrix._datatype;
      var bvalues = sparseMatrix._values;
      var bindex = sparseMatrix._index;
      var bptr = sparseMatrix._ptr;
      var bsize = sparseMatrix._size;
      var bdt = sparseMatrix._datatype;
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length);
      }
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
      }
      if (!bvalues) {
        throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt = typeof adt === "string" && adt === bdt ? adt : void 0;
      var cf = dt ? typed2.find(callback, [dt, dt]) : callback;
      var i, j;
      var cdata = [];
      for (i = 0; i < rows; i++) {
        cdata[i] = [];
      }
      var x = [];
      var w = [];
      for (j = 0; j < columns; j++) {
        var mark = j + 1;
        for (var k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
          i = bindex[k];
          x[i] = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k]);
          w[i] = mark;
        }
        for (i = 0; i < rows; i++) {
          if (w[i] === mark) {
            cdata[i][j] = x[i];
          } else {
            cdata[i][j] = adata[i][j];
          }
        }
      }
      return denseMatrix.createDenseMatrix({
        data: cdata,
        size: [rows, columns],
        datatype: dt
      });
    };
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm04.js
  var name25 = "algorithm04";
  var dependencies26 = ["typed", "equalScalar"];
  var createAlgorithm04 = /* @__PURE__ */ factory(name25, dependencies26, (_ref) => {
    var {
      typed: typed2,
      equalScalar: equalScalar2
    } = _ref;
    return function algorithm042(a, b, callback) {
      var avalues = a._values;
      var aindex = a._index;
      var aptr = a._ptr;
      var asize = a._size;
      var adt = a._datatype;
      var bvalues = b._values;
      var bindex = b._index;
      var bptr = b._ptr;
      var bsize = b._size;
      var bdt = b._datatype;
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length);
      }
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt;
      var eq = equalScalar2;
      var zero = 0;
      var cf = callback;
      if (typeof adt === "string" && adt === bdt) {
        dt = adt;
        eq = typed2.find(equalScalar2, [dt, dt]);
        zero = typed2.convert(0, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var cvalues = avalues && bvalues ? [] : void 0;
      var cindex = [];
      var cptr = [];
      var xa = avalues && bvalues ? [] : void 0;
      var xb = avalues && bvalues ? [] : void 0;
      var wa = [];
      var wb = [];
      var i, j, k, k0, k1;
      for (j = 0; j < columns; j++) {
        cptr[j] = cindex.length;
        var mark = j + 1;
        for (k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
          i = aindex[k];
          cindex.push(i);
          wa[i] = mark;
          if (xa) {
            xa[i] = avalues[k];
          }
        }
        for (k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
          i = bindex[k];
          if (wa[i] === mark) {
            if (xa) {
              var v = cf(xa[i], bvalues[k]);
              if (!eq(v, zero)) {
                xa[i] = v;
              } else {
                wa[i] = null;
              }
            }
          } else {
            cindex.push(i);
            wb[i] = mark;
            if (xb) {
              xb[i] = bvalues[k];
            }
          }
        }
        if (xa && xb) {
          k = cptr[j];
          while (k < cindex.length) {
            i = cindex[k];
            if (wa[i] === mark) {
              cvalues[k] = xa[i];
              k++;
            } else if (wb[i] === mark) {
              cvalues[k] = xb[i];
              k++;
            } else {
              cindex.splice(k, 1);
            }
          }
        }
      }
      cptr[columns] = cindex.length;
      return a.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [rows, columns],
        datatype: dt
      });
    };
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm10.js
  var name26 = "algorithm10";
  var dependencies27 = ["typed", "DenseMatrix"];
  var createAlgorithm10 = /* @__PURE__ */ factory(name26, dependencies27, (_ref) => {
    var {
      typed: typed2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    return function algorithm103(s, b, callback, inverse) {
      var avalues = s._values;
      var aindex = s._index;
      var aptr = s._ptr;
      var asize = s._size;
      var adt = s._datatype;
      if (!avalues) {
        throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt;
      var cf = callback;
      if (typeof adt === "string") {
        dt = adt;
        b = typed2.convert(b, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var cdata = [];
      var x = [];
      var w = [];
      for (var j = 0; j < columns; j++) {
        var mark = j + 1;
        for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
          var r = aindex[k];
          x[r] = avalues[k];
          w[r] = mark;
        }
        for (var i = 0; i < rows; i++) {
          if (j === 0) {
            cdata[i] = [];
          }
          if (w[i] === mark) {
            cdata[i][j] = inverse ? cf(b, x[i]) : cf(x[i], b);
          } else {
            cdata[i][j] = b;
          }
        }
      }
      return new DenseMatrix2({
        data: cdata,
        size: [rows, columns],
        datatype: dt
      });
    };
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm13.js
  var name27 = "algorithm13";
  var dependencies28 = ["typed"];
  var createAlgorithm13 = /* @__PURE__ */ factory(name27, dependencies28, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return function algorithm1310(a, b, callback) {
      var adata = a._data;
      var asize = a._size;
      var adt = a._datatype;
      var bdata = b._data;
      var bsize = b._size;
      var bdt = b._datatype;
      var csize = [];
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length);
      }
      for (var s = 0; s < asize.length; s++) {
        if (asize[s] !== bsize[s]) {
          throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
        }
        csize[s] = asize[s];
      }
      var dt;
      var cf = callback;
      if (typeof adt === "string" && adt === bdt) {
        dt = adt;
        cf = typed2.find(callback, [dt, dt]);
      }
      var cdata = csize.length > 0 ? _iterate(cf, 0, csize, csize[0], adata, bdata) : [];
      return a.createDenseMatrix({
        data: cdata,
        size: csize,
        datatype: dt
      });
    };
    function _iterate(f, level, s, n, av, bv) {
      var cv = [];
      if (level === s.length - 1) {
        for (var i = 0; i < n; i++) {
          cv[i] = f(av[i], bv[i]);
        }
      } else {
        for (var j = 0; j < n; j++) {
          cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv[j]);
        }
      }
      return cv;
    }
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/log10.js
  var name28 = "log10";
  var dependencies29 = ["typed", "config", "Complex"];
  var createLog10 = /* @__PURE__ */ factory(name28, dependencies29, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: _Complex
    } = _ref;
    return typed2(name28, {
      number: function number50(x) {
        if (x >= 0 || config5.predictable) {
          return log10Number(x);
        } else {
          return new _Complex(x, 0).log().div(Math.LN10);
        }
      },
      Complex: function Complex3(x) {
        return new _Complex(x).log().div(Math.LN10);
      },
      BigNumber: function BigNumber2(x) {
        if (!x.isNegative() || config5.predictable) {
          return x.log();
        } else {
          return new _Complex(x.toNumber(), 0).log().div(Math.LN10);
        }
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/log2.js
  var name29 = "log2";
  var dependencies30 = ["typed", "config", "Complex"];
  var createLog2 = /* @__PURE__ */ factory(name29, dependencies30, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3
    } = _ref;
    return typed2(name29, {
      number: function number50(x) {
        if (x >= 0 || config5.predictable) {
          return log2Number(x);
        } else {
          return _log2Complex(new Complex3(x, 0));
        }
      },
      Complex: _log2Complex,
      BigNumber: function BigNumber2(x) {
        if (!x.isNegative() || config5.predictable) {
          return x.log(2);
        } else {
          return _log2Complex(new Complex3(x.toNumber(), 0));
        }
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
    function _log2Complex(x) {
      var newX = Math.sqrt(x.re * x.re + x.im * x.im);
      return new Complex3(Math.log2 ? Math.log2(newX) : Math.log(newX) / Math.LN2, Math.atan2(x.im, x.re) / Math.LN2);
    }
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm03.js
  var name30 = "algorithm03";
  var dependencies31 = ["typed"];
  var createAlgorithm03 = /* @__PURE__ */ factory(name30, dependencies31, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return function algorithm039(denseMatrix, sparseMatrix, callback, inverse) {
      var adata = denseMatrix._data;
      var asize = denseMatrix._size;
      var adt = denseMatrix._datatype;
      var bvalues = sparseMatrix._values;
      var bindex = sparseMatrix._index;
      var bptr = sparseMatrix._ptr;
      var bsize = sparseMatrix._size;
      var bdt = sparseMatrix._datatype;
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length);
      }
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
      }
      if (!bvalues) {
        throw new Error("Cannot perform operation on Dense Matrix and Pattern Sparse Matrix");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt;
      var zero = 0;
      var cf = callback;
      if (typeof adt === "string" && adt === bdt) {
        dt = adt;
        zero = typed2.convert(0, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var cdata = [];
      for (var z = 0; z < rows; z++) {
        cdata[z] = [];
      }
      var x = [];
      var w = [];
      for (var j = 0; j < columns; j++) {
        var mark = j + 1;
        for (var k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
          var i = bindex[k];
          x[i] = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k]);
          w[i] = mark;
        }
        for (var y = 0; y < rows; y++) {
          if (w[y] === mark) {
            cdata[y][j] = x[y];
          } else {
            cdata[y][j] = inverse ? cf(zero, adata[y][j]) : cf(adata[y][j], zero);
          }
        }
      }
      return denseMatrix.createDenseMatrix({
        data: cdata,
        size: [rows, columns],
        datatype: dt
      });
    };
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm05.js
  var name31 = "algorithm05";
  var dependencies32 = ["typed", "equalScalar"];
  var createAlgorithm05 = /* @__PURE__ */ factory(name31, dependencies32, (_ref) => {
    var {
      typed: typed2,
      equalScalar: equalScalar2
    } = _ref;
    return function algorithm053(a, b, callback) {
      var avalues = a._values;
      var aindex = a._index;
      var aptr = a._ptr;
      var asize = a._size;
      var adt = a._datatype;
      var bvalues = b._values;
      var bindex = b._index;
      var bptr = b._ptr;
      var bsize = b._size;
      var bdt = b._datatype;
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length);
      }
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt;
      var eq = equalScalar2;
      var zero = 0;
      var cf = callback;
      if (typeof adt === "string" && adt === bdt) {
        dt = adt;
        eq = typed2.find(equalScalar2, [dt, dt]);
        zero = typed2.convert(0, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var cvalues = avalues && bvalues ? [] : void 0;
      var cindex = [];
      var cptr = [];
      var xa = cvalues ? [] : void 0;
      var xb = cvalues ? [] : void 0;
      var wa = [];
      var wb = [];
      var i, j, k, k1;
      for (j = 0; j < columns; j++) {
        cptr[j] = cindex.length;
        var mark = j + 1;
        for (k = aptr[j], k1 = aptr[j + 1]; k < k1; k++) {
          i = aindex[k];
          cindex.push(i);
          wa[i] = mark;
          if (xa) {
            xa[i] = avalues[k];
          }
        }
        for (k = bptr[j], k1 = bptr[j + 1]; k < k1; k++) {
          i = bindex[k];
          if (wa[i] !== mark) {
            cindex.push(i);
          }
          wb[i] = mark;
          if (xb) {
            xb[i] = bvalues[k];
          }
        }
        if (cvalues) {
          k = cptr[j];
          while (k < cindex.length) {
            i = cindex[k];
            var wai = wa[i];
            var wbi = wb[i];
            if (wai === mark || wbi === mark) {
              var va = wai === mark ? xa[i] : zero;
              var vb = wbi === mark ? xb[i] : zero;
              var vc = cf(va, vb);
              if (!eq(vc, zero)) {
                cvalues.push(vc);
                k++;
              } else {
                cindex.splice(k, 1);
              }
            }
          }
        }
      }
      cptr[columns] = cindex.length;
      return a.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [rows, columns],
        datatype: dt
      });
    };
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm12.js
  var name32 = "algorithm12";
  var dependencies33 = ["typed", "DenseMatrix"];
  var createAlgorithm12 = /* @__PURE__ */ factory(name32, dependencies33, (_ref) => {
    var {
      typed: typed2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    return function algorithm129(s, b, callback, inverse) {
      var avalues = s._values;
      var aindex = s._index;
      var aptr = s._ptr;
      var asize = s._size;
      var adt = s._datatype;
      if (!avalues) {
        throw new Error("Cannot perform operation on Pattern Sparse Matrix and Scalar value");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt;
      var cf = callback;
      if (typeof adt === "string") {
        dt = adt;
        b = typed2.convert(b, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var cdata = [];
      var x = [];
      var w = [];
      for (var j = 0; j < columns; j++) {
        var mark = j + 1;
        for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
          var r = aindex[k];
          x[r] = avalues[k];
          w[r] = mark;
        }
        for (var i = 0; i < rows; i++) {
          if (j === 0) {
            cdata[i] = [];
          }
          if (w[i] === mark) {
            cdata[i][j] = inverse ? cf(b, x[i]) : cf(x[i], b);
          } else {
            cdata[i][j] = inverse ? cf(b, 0) : cf(0, b);
          }
        }
      }
      return new DenseMatrix2({
        data: cdata,
        size: [rows, columns],
        datatype: dt
      });
    };
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/multiplyScalar.js
  var name33 = "multiplyScalar";
  var dependencies34 = ["typed"];
  var createMultiplyScalar = /* @__PURE__ */ factory(name33, dependencies34, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2("multiplyScalar", {
      "number, number": multiplyNumber,
      "Complex, Complex": function ComplexComplex(x, y) {
        return x.mul(y);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.times(y);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.mul(y);
      },
      "number | Fraction | BigNumber | Complex, Unit": function numberFractionBigNumberComplexUnit(x, y) {
        var res = y.clone();
        res.value = res.value === null ? res._normalize(x) : this(res.value, x);
        return res;
      },
      "Unit, number | Fraction | BigNumber | Complex": function UnitNumberFractionBigNumberComplex(x, y) {
        var res = x.clone();
        res.value = res.value === null ? res._normalize(y) : this(res.value, y);
        return res;
      },
      "Unit, Unit": function UnitUnit(x, y) {
        return x.multiply(y);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/multiply.js
  var name34 = "multiply";
  var dependencies35 = ["typed", "matrix", "addScalar", "multiplyScalar", "equalScalar", "dot"];
  var createMultiply = /* @__PURE__ */ factory(name34, dependencies35, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      addScalar: addScalar2,
      multiplyScalar: multiplyScalar2,
      equalScalar: equalScalar2,
      dot: dot2
    } = _ref;
    var algorithm115 = createAlgorithm11({
      typed: typed2,
      equalScalar: equalScalar2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    function _validateMatrixDimensions(size1, size2) {
      switch (size1.length) {
        case 1:
          switch (size2.length) {
            case 1:
              if (size1[0] !== size2[0]) {
                throw new RangeError("Dimension mismatch in multiplication. Vectors must have the same length");
              }
              break;
            case 2:
              if (size1[0] !== size2[0]) {
                throw new RangeError("Dimension mismatch in multiplication. Vector length (" + size1[0] + ") must match Matrix rows (" + size2[0] + ")");
              }
              break;
            default:
              throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + size2.length + " dimensions)");
          }
          break;
        case 2:
          switch (size2.length) {
            case 1:
              if (size1[1] !== size2[0]) {
                throw new RangeError("Dimension mismatch in multiplication. Matrix columns (" + size1[1] + ") must match Vector length (" + size2[0] + ")");
              }
              break;
            case 2:
              if (size1[1] !== size2[0]) {
                throw new RangeError("Dimension mismatch in multiplication. Matrix A columns (" + size1[1] + ") must match Matrix B rows (" + size2[0] + ")");
              }
              break;
            default:
              throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix B has " + size2.length + " dimensions)");
          }
          break;
        default:
          throw new Error("Can only multiply a 1 or 2 dimensional matrix (Matrix A has " + size1.length + " dimensions)");
      }
    }
    function _multiplyVectorVector(a, b, n) {
      if (n === 0) {
        throw new Error("Cannot multiply two empty vectors");
      }
      return dot2(a, b);
    }
    function _multiplyVectorMatrix(a, b) {
      if (b.storage() !== "dense") {
        throw new Error("Support for SparseMatrix not implemented");
      }
      return _multiplyVectorDenseMatrix(a, b);
    }
    function _multiplyVectorDenseMatrix(a, b) {
      var adata = a._data;
      var asize = a._size;
      var adt = a._datatype;
      var bdata = b._data;
      var bsize = b._size;
      var bdt = b._datatype;
      var alength = asize[0];
      var bcolumns = bsize[1];
      var dt;
      var af = addScalar2;
      var mf = multiplyScalar2;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        dt = adt;
        af = typed2.find(addScalar2, [dt, dt]);
        mf = typed2.find(multiplyScalar2, [dt, dt]);
      }
      var c = [];
      for (var j = 0; j < bcolumns; j++) {
        var sum2 = mf(adata[0], bdata[0][j]);
        for (var i = 1; i < alength; i++) {
          sum2 = af(sum2, mf(adata[i], bdata[i][j]));
        }
        c[j] = sum2;
      }
      return a.createDenseMatrix({
        data: c,
        size: [bcolumns],
        datatype: dt
      });
    }
    var _multiplyMatrixVector = typed2("_multiplyMatrixVector", {
      "DenseMatrix, any": _multiplyDenseMatrixVector,
      "SparseMatrix, any": _multiplySparseMatrixVector
    });
    var _multiplyMatrixMatrix = typed2("_multiplyMatrixMatrix", {
      "DenseMatrix, DenseMatrix": _multiplyDenseMatrixDenseMatrix,
      "DenseMatrix, SparseMatrix": _multiplyDenseMatrixSparseMatrix,
      "SparseMatrix, DenseMatrix": _multiplySparseMatrixDenseMatrix,
      "SparseMatrix, SparseMatrix": _multiplySparseMatrixSparseMatrix
    });
    function _multiplyDenseMatrixVector(a, b) {
      var adata = a._data;
      var asize = a._size;
      var adt = a._datatype;
      var bdata = b._data;
      var bdt = b._datatype;
      var arows = asize[0];
      var acolumns = asize[1];
      var dt;
      var af = addScalar2;
      var mf = multiplyScalar2;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        dt = adt;
        af = typed2.find(addScalar2, [dt, dt]);
        mf = typed2.find(multiplyScalar2, [dt, dt]);
      }
      var c = [];
      for (var i = 0; i < arows; i++) {
        var row = adata[i];
        var sum2 = mf(row[0], bdata[0]);
        for (var j = 1; j < acolumns; j++) {
          sum2 = af(sum2, mf(row[j], bdata[j]));
        }
        c[i] = sum2;
      }
      return a.createDenseMatrix({
        data: c,
        size: [arows],
        datatype: dt
      });
    }
    function _multiplyDenseMatrixDenseMatrix(a, b) {
      var adata = a._data;
      var asize = a._size;
      var adt = a._datatype;
      var bdata = b._data;
      var bsize = b._size;
      var bdt = b._datatype;
      var arows = asize[0];
      var acolumns = asize[1];
      var bcolumns = bsize[1];
      var dt;
      var af = addScalar2;
      var mf = multiplyScalar2;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        dt = adt;
        af = typed2.find(addScalar2, [dt, dt]);
        mf = typed2.find(multiplyScalar2, [dt, dt]);
      }
      var c = [];
      for (var i = 0; i < arows; i++) {
        var row = adata[i];
        c[i] = [];
        for (var j = 0; j < bcolumns; j++) {
          var sum2 = mf(row[0], bdata[0][j]);
          for (var x = 1; x < acolumns; x++) {
            sum2 = af(sum2, mf(row[x], bdata[x][j]));
          }
          c[i][j] = sum2;
        }
      }
      return a.createDenseMatrix({
        data: c,
        size: [arows, bcolumns],
        datatype: dt
      });
    }
    function _multiplyDenseMatrixSparseMatrix(a, b) {
      var adata = a._data;
      var asize = a._size;
      var adt = a._datatype;
      var bvalues = b._values;
      var bindex = b._index;
      var bptr = b._ptr;
      var bsize = b._size;
      var bdt = b._datatype;
      if (!bvalues) {
        throw new Error("Cannot multiply Dense Matrix times Pattern only Matrix");
      }
      var arows = asize[0];
      var bcolumns = bsize[1];
      var dt;
      var af = addScalar2;
      var mf = multiplyScalar2;
      var eq = equalScalar2;
      var zero = 0;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        dt = adt;
        af = typed2.find(addScalar2, [dt, dt]);
        mf = typed2.find(multiplyScalar2, [dt, dt]);
        eq = typed2.find(equalScalar2, [dt, dt]);
        zero = typed2.convert(0, dt);
      }
      var cvalues = [];
      var cindex = [];
      var cptr = [];
      var c = b.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [arows, bcolumns],
        datatype: dt
      });
      for (var jb = 0; jb < bcolumns; jb++) {
        cptr[jb] = cindex.length;
        var kb0 = bptr[jb];
        var kb1 = bptr[jb + 1];
        if (kb1 > kb0) {
          var last = 0;
          for (var i = 0; i < arows; i++) {
            var mark = i + 1;
            var cij = void 0;
            for (var kb = kb0; kb < kb1; kb++) {
              var ib = bindex[kb];
              if (last !== mark) {
                cij = mf(adata[i][ib], bvalues[kb]);
                last = mark;
              } else {
                cij = af(cij, mf(adata[i][ib], bvalues[kb]));
              }
            }
            if (last === mark && !eq(cij, zero)) {
              cindex.push(i);
              cvalues.push(cij);
            }
          }
        }
      }
      cptr[bcolumns] = cindex.length;
      return c;
    }
    function _multiplySparseMatrixVector(a, b) {
      var avalues = a._values;
      var aindex = a._index;
      var aptr = a._ptr;
      var adt = a._datatype;
      if (!avalues) {
        throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
      }
      var bdata = b._data;
      var bdt = b._datatype;
      var arows = a._size[0];
      var brows = b._size[0];
      var cvalues = [];
      var cindex = [];
      var cptr = [];
      var dt;
      var af = addScalar2;
      var mf = multiplyScalar2;
      var eq = equalScalar2;
      var zero = 0;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        dt = adt;
        af = typed2.find(addScalar2, [dt, dt]);
        mf = typed2.find(multiplyScalar2, [dt, dt]);
        eq = typed2.find(equalScalar2, [dt, dt]);
        zero = typed2.convert(0, dt);
      }
      var x = [];
      var w = [];
      cptr[0] = 0;
      for (var ib = 0; ib < brows; ib++) {
        var vbi = bdata[ib];
        if (!eq(vbi, zero)) {
          for (var ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
            var ia = aindex[ka];
            if (!w[ia]) {
              w[ia] = true;
              cindex.push(ia);
              x[ia] = mf(vbi, avalues[ka]);
            } else {
              x[ia] = af(x[ia], mf(vbi, avalues[ka]));
            }
          }
        }
      }
      for (var p1 = cindex.length, p = 0; p < p1; p++) {
        var ic = cindex[p];
        cvalues[p] = x[ic];
      }
      cptr[1] = cindex.length;
      return a.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [arows, 1],
        datatype: dt
      });
    }
    function _multiplySparseMatrixDenseMatrix(a, b) {
      var avalues = a._values;
      var aindex = a._index;
      var aptr = a._ptr;
      var adt = a._datatype;
      if (!avalues) {
        throw new Error("Cannot multiply Pattern only Matrix times Dense Matrix");
      }
      var bdata = b._data;
      var bdt = b._datatype;
      var arows = a._size[0];
      var brows = b._size[0];
      var bcolumns = b._size[1];
      var dt;
      var af = addScalar2;
      var mf = multiplyScalar2;
      var eq = equalScalar2;
      var zero = 0;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        dt = adt;
        af = typed2.find(addScalar2, [dt, dt]);
        mf = typed2.find(multiplyScalar2, [dt, dt]);
        eq = typed2.find(equalScalar2, [dt, dt]);
        zero = typed2.convert(0, dt);
      }
      var cvalues = [];
      var cindex = [];
      var cptr = [];
      var c = a.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [arows, bcolumns],
        datatype: dt
      });
      var x = [];
      var w = [];
      for (var jb = 0; jb < bcolumns; jb++) {
        cptr[jb] = cindex.length;
        var mark = jb + 1;
        for (var ib = 0; ib < brows; ib++) {
          var vbij = bdata[ib][jb];
          if (!eq(vbij, zero)) {
            for (var ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
              var ia = aindex[ka];
              if (w[ia] !== mark) {
                w[ia] = mark;
                cindex.push(ia);
                x[ia] = mf(vbij, avalues[ka]);
              } else {
                x[ia] = af(x[ia], mf(vbij, avalues[ka]));
              }
            }
          }
        }
        for (var p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
          var ic = cindex[p];
          cvalues[p] = x[ic];
        }
      }
      cptr[bcolumns] = cindex.length;
      return c;
    }
    function _multiplySparseMatrixSparseMatrix(a, b) {
      var avalues = a._values;
      var aindex = a._index;
      var aptr = a._ptr;
      var adt = a._datatype;
      var bvalues = b._values;
      var bindex = b._index;
      var bptr = b._ptr;
      var bdt = b._datatype;
      var arows = a._size[0];
      var bcolumns = b._size[1];
      var values = avalues && bvalues;
      var dt;
      var af = addScalar2;
      var mf = multiplyScalar2;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        dt = adt;
        af = typed2.find(addScalar2, [dt, dt]);
        mf = typed2.find(multiplyScalar2, [dt, dt]);
      }
      var cvalues = values ? [] : void 0;
      var cindex = [];
      var cptr = [];
      var c = a.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [arows, bcolumns],
        datatype: dt
      });
      var x = values ? [] : void 0;
      var w = [];
      var ka, ka0, ka1, kb, kb0, kb1, ia, ib;
      for (var jb = 0; jb < bcolumns; jb++) {
        cptr[jb] = cindex.length;
        var mark = jb + 1;
        for (kb0 = bptr[jb], kb1 = bptr[jb + 1], kb = kb0; kb < kb1; kb++) {
          ib = bindex[kb];
          if (values) {
            for (ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
              ia = aindex[ka];
              if (w[ia] !== mark) {
                w[ia] = mark;
                cindex.push(ia);
                x[ia] = mf(bvalues[kb], avalues[ka]);
              } else {
                x[ia] = af(x[ia], mf(bvalues[kb], avalues[ka]));
              }
            }
          } else {
            for (ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
              ia = aindex[ka];
              if (w[ia] !== mark) {
                w[ia] = mark;
                cindex.push(ia);
              }
            }
          }
        }
        if (values) {
          for (var p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
            var ic = cindex[p];
            cvalues[p] = x[ic];
          }
        }
      }
      cptr[bcolumns] = cindex.length;
      return c;
    }
    return typed2(name34, extend({
      "Array, Array": function ArrayArray(x, y) {
        _validateMatrixDimensions(arraySize(x), arraySize(y));
        var m = this(matrix2(x), matrix2(y));
        return isMatrix(m) ? m.valueOf() : m;
      },
      "Matrix, Matrix": function MatrixMatrix(x, y) {
        var xsize = x.size();
        var ysize = y.size();
        _validateMatrixDimensions(xsize, ysize);
        if (xsize.length === 1) {
          if (ysize.length === 1) {
            return _multiplyVectorVector(x, y, xsize[0]);
          }
          return _multiplyVectorMatrix(x, y);
        }
        if (ysize.length === 1) {
          return _multiplyMatrixVector(x, y);
        }
        return _multiplyMatrixMatrix(x, y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x, y.storage()), y);
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm115(x, y, multiplyScalar2, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, multiplyScalar2, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm115(y, x, multiplyScalar2, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, multiplyScalar2, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, multiplyScalar2, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, multiplyScalar2, true).valueOf();
      },
      "any, any": multiplyScalar2,
      "any, any, ...any": function anyAnyAny(x, y, rest) {
        var result = this(x, y);
        for (var i = 0; i < rest.length; i++) {
          result = this(result, rest[i]);
        }
        return result;
      }
    }, multiplyScalar2.signatures));
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/sqrt.js
  var name35 = "sqrt";
  var dependencies36 = ["config", "typed", "Complex"];
  var createSqrt = /* @__PURE__ */ factory(name35, dependencies36, (_ref) => {
    var {
      config: config5,
      typed: typed2,
      Complex: Complex3
    } = _ref;
    return typed2("sqrt", {
      number: _sqrtNumber,
      Complex: function Complex4(x) {
        return x.sqrt();
      },
      BigNumber: function BigNumber2(x) {
        if (!x.isNegative() || config5.predictable) {
          return x.sqrt();
        } else {
          return _sqrtNumber(x.toNumber());
        }
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      },
      Unit: function Unit2(x) {
        return x.pow(0.5);
      }
    });
    function _sqrtNumber(x) {
      if (isNaN(x)) {
        return NaN;
      } else if (x >= 0 || config5.predictable) {
        return Math.sqrt(x);
      } else {
        return new Complex3(x, 0).sqrt();
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/subtract.js
  var name36 = "subtract";
  var dependencies37 = ["typed", "matrix", "equalScalar", "addScalar", "unaryMinus", "DenseMatrix"];
  var createSubtract = /* @__PURE__ */ factory(name36, dependencies37, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      equalScalar: equalScalar2,
      addScalar: addScalar2,
      unaryMinus: unaryMinus2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm013 = createAlgorithm01({
      typed: typed2
    });
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm053 = createAlgorithm05({
      typed: typed2,
      equalScalar: equalScalar2
    });
    var algorithm103 = createAlgorithm10({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name36, {
      "number, number": function numberNumber2(x, y) {
        return x - y;
      },
      "Complex, Complex": function ComplexComplex(x, y) {
        return x.sub(y);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.minus(y);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.sub(y);
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (x.value === null) {
          throw new Error("Parameter x contains a unit with undefined value");
        }
        if (y.value === null) {
          throw new Error("Parameter y contains a unit with undefined value");
        }
        if (!x.equalBase(y)) {
          throw new Error("Units do not match");
        }
        var res = x.clone();
        res.value = this(res.value, y.value);
        res.fixPrefix = false;
        return res;
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        checkEqualDimensions(x, y);
        return algorithm053(x, y, this);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        checkEqualDimensions(x, y);
        return algorithm039(y, x, this, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        checkEqualDimensions(x, y);
        return algorithm013(x, y, this, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        checkEqualDimensions(x, y);
        return algorithm1310(x, y, this);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm103(x, unaryMinus2(y), addScalar2);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, this);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm103(y, x, this, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, this, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, this, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });
  function checkEqualDimensions(x, y) {
    var xsize = x.size();
    var ysize = y.size();
    if (xsize.length !== ysize.length) {
      throw new DimensionError(xsize.length, ysize.length);
    }
  }

  // node_modules/mathjs/lib/esm/function/arithmetic/xgcd.js
  var name37 = "xgcd";
  var dependencies38 = ["typed", "config", "matrix", "BigNumber"];
  var createXgcd = /* @__PURE__ */ factory(name37, dependencies38, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      BigNumber: BigNumber2
    } = _ref;
    return typed2(name37, {
      "number, number": function numberNumber2(a, b) {
        var res = xgcdNumber(a, b);
        return config5.matrix === "Array" ? res : matrix2(res);
      },
      "BigNumber, BigNumber": _xgcdBigNumber
    });
    function _xgcdBigNumber(a, b) {
      var t;
      var q;
      var r;
      var zero = new BigNumber2(0);
      var one = new BigNumber2(1);
      var x = zero;
      var lastx = one;
      var y = one;
      var lasty = zero;
      if (!a.isInt() || !b.isInt()) {
        throw new Error("Parameters in function xgcd must be integer numbers");
      }
      while (!b.isZero()) {
        q = a.div(b).floor();
        r = a.mod(b);
        t = x;
        x = lastx.minus(q.times(x));
        lastx = t;
        t = y;
        y = lasty.minus(q.times(y));
        lasty = t;
        a = b;
        b = r;
      }
      var res;
      if (a.lt(zero)) {
        res = [a.neg(), lastx.neg(), lasty.neg()];
      } else {
        res = [a, !a.isZero() ? lastx : 0, lasty];
      }
      return config5.matrix === "Array" ? res : matrix2(res);
    }
  });

  // node_modules/mathjs/lib/esm/type/matrix/utils/algorithm07.js
  var name38 = "algorithm07";
  var dependencies39 = ["typed", "DenseMatrix"];
  var createAlgorithm07 = /* @__PURE__ */ factory(name38, dependencies39, (_ref) => {
    var {
      typed: typed2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    return function algorithm077(a, b, callback) {
      var asize = a._size;
      var adt = a._datatype;
      var bsize = b._size;
      var bdt = b._datatype;
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length);
      }
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError("Dimension mismatch. Matrix A (" + asize + ") must match Matrix B (" + bsize + ")");
      }
      var rows = asize[0];
      var columns = asize[1];
      var dt;
      var zero = 0;
      var cf = callback;
      if (typeof adt === "string" && adt === bdt) {
        dt = adt;
        zero = typed2.convert(0, dt);
        cf = typed2.find(callback, [dt, dt]);
      }
      var i, j;
      var cdata = [];
      for (i = 0; i < rows; i++) {
        cdata[i] = [];
      }
      var xa = [];
      var xb = [];
      var wa = [];
      var wb = [];
      for (j = 0; j < columns; j++) {
        var mark = j + 1;
        _scatter(a, j, wa, xa, mark);
        _scatter(b, j, wb, xb, mark);
        for (i = 0; i < rows; i++) {
          var va = wa[i] === mark ? xa[i] : zero;
          var vb = wb[i] === mark ? xb[i] : zero;
          cdata[i][j] = cf(va, vb);
        }
      }
      return new DenseMatrix2({
        data: cdata,
        size: [rows, columns],
        datatype: dt
      });
    };
    function _scatter(m, j, w, x, mark) {
      var values = m._values;
      var index = m._index;
      var ptr = m._ptr;
      for (var k = ptr[j], k1 = ptr[j + 1]; k < k1; k++) {
        var i = index[k];
        w[i] = mark;
        x[i] = values[k];
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/complex/conj.js
  var name39 = "conj";
  var dependencies40 = ["typed"];
  var createConj = /* @__PURE__ */ factory(name39, dependencies40, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name39, {
      number: function number50(x) {
        return x;
      },
      BigNumber: function BigNumber2(x) {
        return x;
      },
      Complex: function Complex3(x) {
        return x.conjugate();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/utils/function.js
  function memoize(fn, hasher2) {
    return function memoize2() {
      if (typeof memoize2.cache !== "object") {
        memoize2.cache = {};
      }
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }
      var hash = hasher2 ? hasher2(args) : JSON.stringify(args);
      if (!(hash in memoize2.cache)) {
        memoize2.cache[hash] = fn.apply(fn, args);
      }
      return memoize2.cache[hash];
    };
  }

  // node_modules/mathjs/lib/esm/function/matrix/identity.js
  var name40 = "identity";
  var dependencies41 = ["typed", "config", "matrix", "BigNumber", "DenseMatrix", "SparseMatrix"];
  var createIdentity = /* @__PURE__ */ factory(name40, dependencies41, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      BigNumber: BigNumber2,
      DenseMatrix: DenseMatrix2,
      SparseMatrix: SparseMatrix2
    } = _ref;
    return typed2(name40, {
      "": function _() {
        return config5.matrix === "Matrix" ? matrix2([]) : [];
      },
      string: function string11(format5) {
        return matrix2(format5);
      },
      "number | BigNumber": function numberBigNumber(rows) {
        return _identity(rows, rows, config5.matrix === "Matrix" ? "dense" : void 0);
      },
      "number | BigNumber, string": function numberBigNumberString(rows, format5) {
        return _identity(rows, rows, format5);
      },
      "number | BigNumber, number | BigNumber": function numberBigNumberNumberBigNumber(rows, cols) {
        return _identity(rows, cols, config5.matrix === "Matrix" ? "dense" : void 0);
      },
      "number | BigNumber, number | BigNumber, string": function numberBigNumberNumberBigNumberString(rows, cols, format5) {
        return _identity(rows, cols, format5);
      },
      Array: function Array2(size2) {
        return _identityVector(size2);
      },
      "Array, string": function ArrayString(size2, format5) {
        return _identityVector(size2, format5);
      },
      Matrix: function Matrix2(size2) {
        return _identityVector(size2.valueOf(), size2.storage());
      },
      "Matrix, string": function MatrixString(size2, format5) {
        return _identityVector(size2.valueOf(), format5);
      }
    });
    function _identityVector(size2, format5) {
      switch (size2.length) {
        case 0:
          return format5 ? matrix2(format5) : [];
        case 1:
          return _identity(size2[0], size2[0], format5);
        case 2:
          return _identity(size2[0], size2[1], format5);
        default:
          throw new Error("Vector containing two values expected");
      }
    }
    function _identity(rows, cols, format5) {
      var Big = isBigNumber(rows) || isBigNumber(cols) ? BigNumber2 : null;
      if (isBigNumber(rows))
        rows = rows.toNumber();
      if (isBigNumber(cols))
        cols = cols.toNumber();
      if (!isInteger(rows) || rows < 1) {
        throw new Error("Parameters in function identity must be positive integers");
      }
      if (!isInteger(cols) || cols < 1) {
        throw new Error("Parameters in function identity must be positive integers");
      }
      var one = Big ? new BigNumber2(1) : 1;
      var defaultValue = Big ? new Big(0) : 0;
      var size2 = [rows, cols];
      if (format5) {
        if (format5 === "sparse") {
          return SparseMatrix2.diagonal(size2, one, 0, defaultValue);
        }
        if (format5 === "dense") {
          return DenseMatrix2.diagonal(size2, one, 0, defaultValue);
        }
        throw new TypeError('Unknown matrix type "'.concat(format5, '"'));
      }
      var res = resize([], size2, defaultValue);
      var minimum = rows < cols ? rows : cols;
      for (var d = 0; d < minimum; d++) {
        res[d][d] = one;
      }
      return res;
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/ones.js
  var name41 = "ones";
  var dependencies42 = ["typed", "config", "matrix", "BigNumber"];
  var createOnes = /* @__PURE__ */ factory(name41, dependencies42, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      BigNumber: BigNumber2
    } = _ref;
    return typed2("ones", {
      "": function _() {
        return config5.matrix === "Array" ? _ones([]) : _ones([], "default");
      },
      "...number | BigNumber | string": function numberBigNumberString(size2) {
        var last = size2[size2.length - 1];
        if (typeof last === "string") {
          var format5 = size2.pop();
          return _ones(size2, format5);
        } else if (config5.matrix === "Array") {
          return _ones(size2);
        } else {
          return _ones(size2, "default");
        }
      },
      Array: _ones,
      Matrix: function Matrix2(size2) {
        var format5 = size2.storage();
        return _ones(size2.valueOf(), format5);
      },
      "Array | Matrix, string": function ArrayMatrixString(size2, format5) {
        return _ones(size2.valueOf(), format5);
      }
    });
    function _ones(size2, format5) {
      var hasBigNumbers = _normalize(size2);
      var defaultValue = hasBigNumbers ? new BigNumber2(1) : 1;
      _validate2(size2);
      if (format5) {
        var m = matrix2(format5);
        if (size2.length > 0) {
          return m.resize(size2, defaultValue);
        }
        return m;
      } else {
        var arr = [];
        if (size2.length > 0) {
          return resize(arr, size2, defaultValue);
        }
        return arr;
      }
    }
    function _normalize(size2) {
      var hasBigNumbers = false;
      size2.forEach(function(value, index, arr) {
        if (isBigNumber(value)) {
          hasBigNumbers = true;
          arr[index] = value.toNumber();
        }
      });
      return hasBigNumbers;
    }
    function _validate2(size2) {
      size2.forEach(function(value) {
        if (typeof value !== "number" || !isInteger(value) || value < 0) {
          throw new Error("Parameters in function ones must be positive integers");
        }
      });
    }
  });

  // node_modules/mathjs/lib/esm/utils/noop.js
  function noBignumber() {
    throw new Error('No "bignumber" implementation available');
  }
  function noFraction() {
    throw new Error('No "fraction" implementation available');
  }
  function noMatrix() {
    throw new Error('No "matrix" implementation available');
  }

  // node_modules/mathjs/lib/esm/function/matrix/range.js
  var name42 = "range";
  var dependencies43 = ["typed", "config", "?matrix", "?bignumber", "smaller", "smallerEq", "larger", "largerEq"];
  var createRange = /* @__PURE__ */ factory(name42, dependencies43, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      bignumber: bignumber2,
      smaller: smaller2,
      smallerEq: smallerEq2,
      larger: larger2,
      largerEq: largerEq2
    } = _ref;
    return typed2(name42, {
      string: _strRange,
      "string, boolean": _strRange,
      "number, number": function numberNumber2(start, end) {
        return _out(_rangeEx(start, end, 1));
      },
      "number, number, number": function numberNumberNumber(start, end, step) {
        return _out(_rangeEx(start, end, step));
      },
      "number, number, boolean": function numberNumberBoolean(start, end, includeEnd) {
        return includeEnd ? _out(_rangeInc(start, end, 1)) : _out(_rangeEx(start, end, 1));
      },
      "number, number, number, boolean": function numberNumberNumberBoolean(start, end, step, includeEnd) {
        return includeEnd ? _out(_rangeInc(start, end, step)) : _out(_rangeEx(start, end, step));
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(start, end) {
        var BigNumber2 = start.constructor;
        return _out(_bigRangeEx(start, end, new BigNumber2(1)));
      },
      "BigNumber, BigNumber, BigNumber": function BigNumberBigNumberBigNumber(start, end, step) {
        return _out(_bigRangeEx(start, end, step));
      },
      "BigNumber, BigNumber, boolean": function BigNumberBigNumberBoolean(start, end, includeEnd) {
        var BigNumber2 = start.constructor;
        return includeEnd ? _out(_bigRangeInc(start, end, new BigNumber2(1))) : _out(_bigRangeEx(start, end, new BigNumber2(1)));
      },
      "BigNumber, BigNumber, BigNumber, boolean": function BigNumberBigNumberBigNumberBoolean(start, end, step, includeEnd) {
        return includeEnd ? _out(_bigRangeInc(start, end, step)) : _out(_bigRangeEx(start, end, step));
      }
    });
    function _out(arr) {
      if (config5.matrix === "Matrix") {
        return matrix2 ? matrix2(arr) : noMatrix();
      }
      return arr;
    }
    function _strRange(str, includeEnd) {
      var r = _parse(str);
      if (!r) {
        throw new SyntaxError('String "' + str + '" is no valid range');
      }
      var fn;
      if (config5.number === "BigNumber") {
        if (bignumber2 === void 0) {
          noBignumber();
        }
        fn = includeEnd ? _bigRangeInc : _bigRangeEx;
        return _out(fn(bignumber2(r.start), bignumber2(r.end), bignumber2(r.step)));
      } else {
        fn = includeEnd ? _rangeInc : _rangeEx;
        return _out(fn(r.start, r.end, r.step));
      }
    }
    function _rangeEx(start, end, step) {
      var array13 = [];
      var x = start;
      if (step > 0) {
        while (smaller2(x, end)) {
          array13.push(x);
          x += step;
        }
      } else if (step < 0) {
        while (larger2(x, end)) {
          array13.push(x);
          x += step;
        }
      }
      return array13;
    }
    function _rangeInc(start, end, step) {
      var array13 = [];
      var x = start;
      if (step > 0) {
        while (smallerEq2(x, end)) {
          array13.push(x);
          x += step;
        }
      } else if (step < 0) {
        while (largerEq2(x, end)) {
          array13.push(x);
          x += step;
        }
      }
      return array13;
    }
    function _bigRangeEx(start, end, step) {
      var zero = bignumber2(0);
      var array13 = [];
      var x = start;
      if (step.gt(zero)) {
        while (smaller2(x, end)) {
          array13.push(x);
          x = x.plus(step);
        }
      } else if (step.lt(zero)) {
        while (larger2(x, end)) {
          array13.push(x);
          x = x.plus(step);
        }
      }
      return array13;
    }
    function _bigRangeInc(start, end, step) {
      var zero = bignumber2(0);
      var array13 = [];
      var x = start;
      if (step.gt(zero)) {
        while (smallerEq2(x, end)) {
          array13.push(x);
          x = x.plus(step);
        }
      } else if (step.lt(zero)) {
        while (largerEq2(x, end)) {
          array13.push(x);
          x = x.plus(step);
        }
      }
      return array13;
    }
    function _parse(str) {
      var args = str.split(":");
      var nums = args.map(function(arg) {
        return Number(arg);
      });
      var invalid = nums.some(function(num) {
        return isNaN(num);
      });
      if (invalid) {
        return null;
      }
      switch (nums.length) {
        case 2:
          return {
            start: nums[0],
            end: nums[1],
            step: 1
          };
        case 3:
          return {
            start: nums[0],
            end: nums[2],
            step: nums[1]
          };
        default:
          return null;
      }
    }
  });

  // node_modules/mathjs/lib/esm/error/ArgumentsError.js
  function ArgumentsError(fn, count, min2, max2) {
    if (!(this instanceof ArgumentsError)) {
      throw new SyntaxError("Constructor must be called with the new operator");
    }
    this.fn = fn;
    this.count = count;
    this.min = min2;
    this.max = max2;
    this.message = "Wrong number of arguments in function " + fn + " (" + count + " provided, " + min2 + (max2 !== void 0 && max2 !== null ? "-" + max2 : "") + " expected)";
    this.stack = new Error().stack;
  }
  ArgumentsError.prototype = new Error();
  ArgumentsError.prototype.constructor = Error;
  ArgumentsError.prototype.name = "ArgumentsError";
  ArgumentsError.prototype.isArgumentsError = true;

  // node_modules/mathjs/lib/esm/function/matrix/resize.js
  var name43 = "resize";
  var dependencies44 = ["config", "matrix"];
  var createResize = /* @__PURE__ */ factory(name43, dependencies44, (_ref) => {
    var {
      config: config5,
      matrix: matrix2
    } = _ref;
    return function resize3(x, size2, defaultValue) {
      if (arguments.length !== 2 && arguments.length !== 3) {
        throw new ArgumentsError("resize", arguments.length, 2, 3);
      }
      if (isMatrix(size2)) {
        size2 = size2.valueOf();
      }
      if (isBigNumber(size2[0])) {
        size2 = size2.map(function(value) {
          return !isBigNumber(value) ? value : value.toNumber();
        });
      }
      if (isMatrix(x)) {
        return x.resize(size2, defaultValue, true);
      }
      if (typeof x === "string") {
        return _resizeString(x, size2, defaultValue);
      }
      var asMatrix = Array.isArray(x) ? false : config5.matrix !== "Array";
      if (size2.length === 0) {
        while (Array.isArray(x)) {
          x = x[0];
        }
        return clone(x);
      } else {
        if (!Array.isArray(x)) {
          x = [x];
        }
        x = clone(x);
        var res = resize(x, size2, defaultValue);
        return asMatrix ? matrix2(res) : res;
      }
    };
    function _resizeString(str, size2, defaultChar) {
      if (defaultChar !== void 0) {
        if (typeof defaultChar !== "string" || defaultChar.length !== 1) {
          throw new TypeError("Single character expected as defaultValue");
        }
      } else {
        defaultChar = " ";
      }
      if (size2.length !== 1) {
        throw new DimensionError(size2.length, 1);
      }
      var len = size2[0];
      if (typeof len !== "number" || !isInteger(len)) {
        throw new TypeError("Invalid size, must contain positive integers (size: " + format3(size2) + ")");
      }
      if (str.length > len) {
        return str.substring(0, len);
      } else if (str.length < len) {
        var res = str;
        for (var i = 0, ii = len - str.length; i < ii; i++) {
          res += defaultChar;
        }
        return res;
      } else {
        return str;
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/rotationMatrix.js
  var name44 = "rotationMatrix";
  var dependencies45 = ["typed", "config", "multiplyScalar", "addScalar", "unaryMinus", "norm", "matrix", "BigNumber", "DenseMatrix", "SparseMatrix", "cos", "sin"];
  var createRotationMatrix = /* @__PURE__ */ factory(name44, dependencies45, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      multiplyScalar: multiplyScalar2,
      addScalar: addScalar2,
      unaryMinus: unaryMinus2,
      norm: norm2,
      BigNumber: BigNumber2,
      matrix: matrix2,
      DenseMatrix: DenseMatrix2,
      SparseMatrix: SparseMatrix2,
      cos: cos2,
      sin: sin2
    } = _ref;
    return typed2(name44, {
      "": function _() {
        return config5.matrix === "Matrix" ? matrix2([]) : [];
      },
      string: function string11(format5) {
        return matrix2(format5);
      },
      "number | BigNumber | Complex | Unit": function numberBigNumberComplexUnit(theta) {
        return _rotationMatrix2x2(theta, config5.matrix === "Matrix" ? "dense" : void 0);
      },
      "number | BigNumber | Complex | Unit, string": function numberBigNumberComplexUnitString(theta, format5) {
        return _rotationMatrix2x2(theta, format5);
      },
      "number | BigNumber | Complex | Unit, Array": function numberBigNumberComplexUnitArray(theta, v) {
        var matrixV = matrix2(v);
        _validateVector(matrixV);
        return _rotationMatrix3x3(theta, matrixV, void 0);
      },
      "number | BigNumber | Complex | Unit, Matrix": function numberBigNumberComplexUnitMatrix(theta, v) {
        _validateVector(v);
        var storageType = v.storage() || (config5.matrix === "Matrix" ? "dense" : void 0);
        return _rotationMatrix3x3(theta, v, storageType);
      },
      "number | BigNumber | Complex | Unit, Array, string": function numberBigNumberComplexUnitArrayString(theta, v, format5) {
        var matrixV = matrix2(v);
        _validateVector(matrixV);
        return _rotationMatrix3x3(theta, matrixV, format5);
      },
      "number | BigNumber | Complex | Unit, Matrix, string": function numberBigNumberComplexUnitMatrixString(theta, v, format5) {
        _validateVector(v);
        return _rotationMatrix3x3(theta, v, format5);
      }
    });
    function _rotationMatrix2x2(theta, format5) {
      var Big = isBigNumber(theta);
      var minusOne = Big ? new BigNumber2(-1) : -1;
      var cosTheta = cos2(theta);
      var sinTheta = sin2(theta);
      var data = [[cosTheta, multiplyScalar2(minusOne, sinTheta)], [sinTheta, cosTheta]];
      return _convertToFormat(data, format5);
    }
    function _validateVector(v) {
      var size2 = v.size();
      if (size2.length < 1 || size2[0] !== 3) {
        throw new RangeError("Vector must be of dimensions 1x3");
      }
    }
    function _mul(array13) {
      return array13.reduce((p, curr) => multiplyScalar2(p, curr));
    }
    function _convertToFormat(data, format5) {
      if (format5) {
        if (format5 === "sparse") {
          return new SparseMatrix2(data);
        }
        if (format5 === "dense") {
          return new DenseMatrix2(data);
        }
        throw new TypeError('Unknown matrix type "'.concat(format5, '"'));
      }
      return data;
    }
    function _rotationMatrix3x3(theta, v, format5) {
      var normV = norm2(v);
      if (normV === 0) {
        throw new RangeError("Rotation around zero vector");
      }
      var Big = isBigNumber(theta) ? BigNumber2 : null;
      var one = Big ? new Big(1) : 1;
      var minusOne = Big ? new Big(-1) : -1;
      var vx = Big ? new Big(v.get([0]) / normV) : v.get([0]) / normV;
      var vy = Big ? new Big(v.get([1]) / normV) : v.get([1]) / normV;
      var vz = Big ? new Big(v.get([2]) / normV) : v.get([2]) / normV;
      var c = cos2(theta);
      var oneMinusC = addScalar2(one, unaryMinus2(c));
      var s = sin2(theta);
      var r11 = addScalar2(c, _mul([vx, vx, oneMinusC]));
      var r12 = addScalar2(_mul([vx, vy, oneMinusC]), _mul([minusOne, vz, s]));
      var r13 = addScalar2(_mul([vx, vz, oneMinusC]), _mul([vy, s]));
      var r21 = addScalar2(_mul([vx, vy, oneMinusC]), _mul([vz, s]));
      var r22 = addScalar2(c, _mul([vy, vy, oneMinusC]));
      var r23 = addScalar2(_mul([vy, vz, oneMinusC]), _mul([minusOne, vx, s]));
      var r31 = addScalar2(_mul([vx, vz, oneMinusC]), _mul([minusOne, vy, s]));
      var r32 = addScalar2(_mul([vy, vz, oneMinusC]), _mul([vx, s]));
      var r33 = addScalar2(c, _mul([vz, vz, oneMinusC]));
      var data = [[r11, r12, r13], [r21, r22, r23], [r31, r32, r33]];
      return _convertToFormat(data, format5);
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/size.js
  var name45 = "size";
  var dependencies46 = ["typed", "config", "?matrix"];
  var createSize = /* @__PURE__ */ factory(name45, dependencies46, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2
    } = _ref;
    return typed2(name45, {
      Matrix: function Matrix2(x) {
        return x.create(x.size());
      },
      Array: arraySize,
      string: function string11(x) {
        return config5.matrix === "Array" ? [x.length] : matrix2([x.length]);
      },
      "number | Complex | BigNumber | Unit | boolean | null": function numberComplexBigNumberUnitBooleanNull(x) {
        return config5.matrix === "Array" ? [] : matrix2 ? matrix2([]) : noMatrix();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/matrix/transpose.js
  var name46 = "transpose";
  var dependencies47 = ["typed", "matrix"];
  var createTranspose = /* @__PURE__ */ factory(name46, dependencies47, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2
    } = _ref;
    return typed2("transpose", {
      Array: function Array2(x) {
        return this(matrix2(x)).valueOf();
      },
      Matrix: function Matrix2(x) {
        var size2 = x.size();
        var c;
        switch (size2.length) {
          case 1:
            c = x.clone();
            break;
          case 2:
            {
              var rows = size2[0];
              var columns = size2[1];
              if (columns === 0) {
                throw new RangeError("Cannot transpose a 2D matrix with no columns (size: " + format3(size2) + ")");
              }
              switch (x.storage()) {
                case "dense":
                  c = _denseTranspose(x, rows, columns);
                  break;
                case "sparse":
                  c = _sparseTranspose(x, rows, columns);
                  break;
              }
            }
            break;
          default:
            throw new RangeError("Matrix must be a vector or two dimensional (size: " + format3(this._size) + ")");
        }
        return c;
      },
      any: function any(x) {
        return clone(x);
      }
    });
    function _denseTranspose(m, rows, columns) {
      var data = m._data;
      var transposed = [];
      var transposedRow;
      for (var j = 0; j < columns; j++) {
        transposedRow = transposed[j] = [];
        for (var i = 0; i < rows; i++) {
          transposedRow[i] = clone(data[i][j]);
        }
      }
      return m.createDenseMatrix({
        data: transposed,
        size: [columns, rows],
        datatype: m._datatype
      });
    }
    function _sparseTranspose(m, rows, columns) {
      var values = m._values;
      var index = m._index;
      var ptr = m._ptr;
      var cvalues = values ? [] : void 0;
      var cindex = [];
      var cptr = [];
      var w = [];
      for (var x = 0; x < rows; x++) {
        w[x] = 0;
      }
      var p, l, j;
      for (p = 0, l = index.length; p < l; p++) {
        w[index[p]]++;
      }
      var sum2 = 0;
      for (var i = 0; i < rows; i++) {
        cptr.push(sum2);
        sum2 += w[i];
        w[i] = cptr[i];
      }
      cptr.push(sum2);
      for (j = 0; j < columns; j++) {
        for (var k0 = ptr[j], k1 = ptr[j + 1], k = k0; k < k1; k++) {
          var q = w[index[k]]++;
          cindex[q] = j;
          if (values) {
            cvalues[q] = clone(values[k]);
          }
        }
      }
      return m.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [columns, rows],
        datatype: m._datatype
      });
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/ctranspose.js
  var name47 = "ctranspose";
  var dependencies48 = ["typed", "transpose", "conj"];
  var createCtranspose = /* @__PURE__ */ factory(name47, dependencies48, (_ref) => {
    var {
      typed: typed2,
      transpose: transpose2,
      conj: conj2
    } = _ref;
    return typed2(name47, {
      any: function any(x) {
        return conj2(transpose2(x));
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/matrix/zeros.js
  var name48 = "zeros";
  var dependencies49 = ["typed", "config", "matrix", "BigNumber"];
  var createZeros = /* @__PURE__ */ factory(name48, dependencies49, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      BigNumber: BigNumber2
    } = _ref;
    return typed2(name48, {
      "": function _() {
        return config5.matrix === "Array" ? _zeros([]) : _zeros([], "default");
      },
      "...number | BigNumber | string": function numberBigNumberString(size2) {
        var last = size2[size2.length - 1];
        if (typeof last === "string") {
          var format5 = size2.pop();
          return _zeros(size2, format5);
        } else if (config5.matrix === "Array") {
          return _zeros(size2);
        } else {
          return _zeros(size2, "default");
        }
      },
      Array: _zeros,
      Matrix: function Matrix2(size2) {
        var format5 = size2.storage();
        return _zeros(size2.valueOf(), format5);
      },
      "Array | Matrix, string": function ArrayMatrixString(size2, format5) {
        return _zeros(size2.valueOf(), format5);
      }
    });
    function _zeros(size2, format5) {
      var hasBigNumbers = _normalize(size2);
      var defaultValue = hasBigNumbers ? new BigNumber2(0) : 0;
      _validate2(size2);
      if (format5) {
        var m = matrix2(format5);
        if (size2.length > 0) {
          return m.resize(size2, defaultValue);
        }
        return m;
      } else {
        var arr = [];
        if (size2.length > 0) {
          return resize(arr, size2, defaultValue);
        }
        return arr;
      }
    }
    function _normalize(size2) {
      var hasBigNumbers = false;
      size2.forEach(function(value, index, arr) {
        if (isBigNumber(value)) {
          hasBigNumbers = true;
          arr[index] = value.toNumber();
        }
      });
      return hasBigNumbers;
    }
    function _validate2(size2) {
      size2.forEach(function(value) {
        if (typeof value !== "number" || !isInteger(value) || value < 0) {
          throw new Error("Parameters in function zeros must be positive integers");
        }
      });
    }
  });

  // node_modules/mathjs/lib/esm/function/statistics/utils/improveErrorMessage.js
  function improveErrorMessage(err, fnName, value) {
    var details;
    if (String(err).indexOf("Unexpected type") !== -1) {
      details = arguments.length > 2 ? " (type: " + typeOf(value) + ", value: " + JSON.stringify(value) + ")" : " (type: " + err.data.actual + ")";
      return new TypeError("Cannot calculate " + fnName + ", unexpected type of argument" + details);
    }
    if (String(err).indexOf("complex numbers") !== -1) {
      details = arguments.length > 2 ? " (type: " + typeOf(value) + ", value: " + JSON.stringify(value) + ")" : "";
      return new TypeError("Cannot calculate " + fnName + ", no ordering relation is defined for complex numbers" + details);
    }
    return err;
  }

  // node_modules/mathjs/lib/esm/function/statistics/prod.js
  var name49 = "prod";
  var dependencies50 = ["typed", "config", "multiplyScalar", "numeric"];
  var createProd = /* @__PURE__ */ factory(name49, dependencies50, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      multiplyScalar: multiplyScalar2,
      numeric: numeric2
    } = _ref;
    return typed2(name49, {
      "Array | Matrix": _prod,
      "Array | Matrix, number | BigNumber": function ArrayMatrixNumberBigNumber(array13, dim) {
        throw new Error("prod(A, dim) is not yet supported");
      },
      "...": function _(args) {
        return _prod(args);
      }
    });
    function _prod(array13) {
      var prod2;
      deepForEach(array13, function(value) {
        try {
          prod2 = prod2 === void 0 ? value : multiplyScalar2(prod2, value);
        } catch (err) {
          throw improveErrorMessage(err, "prod", value);
        }
      });
      if (typeof prod2 === "string") {
        prod2 = numeric2(prod2, config5.number);
      }
      if (prod2 === void 0) {
        throw new Error("Cannot calculate prod of an empty array");
      }
      return prod2;
    }
  });

  // node_modules/mathjs/lib/esm/function/string/format.js
  var name50 = "format";
  var dependencies51 = ["typed"];
  var createFormat = /* @__PURE__ */ factory(name50, dependencies51, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name50, {
      any: format3,
      "any, Object | function | number": format3
    });
  });

  // node_modules/mathjs/lib/esm/function/utils/numeric.js
  var name51 = "numeric";
  var dependencies52 = ["number", "?bignumber", "?fraction"];
  var createNumeric = /* @__PURE__ */ factory(name51, dependencies52, (_ref) => {
    var {
      number: _number,
      bignumber: bignumber2,
      fraction: fraction3
    } = _ref;
    var validInputTypes = {
      string: true,
      number: true,
      BigNumber: true,
      Fraction: true
    };
    var validOutputTypes = {
      number: (x) => _number(x),
      BigNumber: bignumber2 ? (x) => bignumber2(x) : noBignumber,
      Fraction: fraction3 ? (x) => fraction3(x) : noFraction
    };
    return function numeric2(value, outputType) {
      var inputType = typeOf(value);
      if (!(inputType in validInputTypes)) {
        throw new TypeError("Cannot convert " + value + ' of type "' + inputType + '"; valid input types are ' + Object.keys(validInputTypes).join(", "));
      }
      if (!(outputType in validOutputTypes)) {
        throw new TypeError("Cannot convert " + value + ' to type "' + outputType + '"; valid output types are ' + Object.keys(validOutputTypes).join(", "));
      }
      if (outputType === inputType) {
        return value;
      } else {
        return validOutputTypes[outputType](value);
      }
    };
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/divideScalar.js
  var name52 = "divideScalar";
  var dependencies53 = ["typed", "numeric"];
  var createDivideScalar = /* @__PURE__ */ factory(name52, dependencies53, (_ref) => {
    var {
      typed: typed2,
      numeric: numeric2
    } = _ref;
    return typed2(name52, {
      "number, number": function numberNumber2(x, y) {
        return x / y;
      },
      "Complex, Complex": function ComplexComplex(x, y) {
        return x.div(y);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.div(y);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.div(y);
      },
      "Unit, number | Fraction | BigNumber": function UnitNumberFractionBigNumber(x, y) {
        var res = x.clone();
        var one = numeric2(1, typeOf(y));
        res.value = this(res.value === null ? res._normalize(one) : res.value, y);
        return res;
      },
      "number | Fraction | BigNumber, Unit": function numberFractionBigNumberUnit(x, y) {
        var res = y.clone();
        res = res.pow(-1);
        var one = numeric2(1, typeOf(x));
        res.value = this(x, y.value === null ? y._normalize(one) : y.value);
        return res;
      },
      "Unit, Unit": function UnitUnit(x, y) {
        return x.divide(y);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/pow.js
  var name53 = "pow";
  var dependencies54 = ["typed", "config", "identity", "multiply", "matrix", "fraction", "number", "Complex"];
  var createPow = /* @__PURE__ */ factory(name53, dependencies54, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      identity: identity2,
      multiply: multiply2,
      matrix: matrix2,
      number: number50,
      fraction: fraction3,
      Complex: Complex3
    } = _ref;
    return typed2(name53, {
      "number, number": _pow,
      "Complex, Complex": function ComplexComplex(x, y) {
        return x.pow(y);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        if (y.isInteger() || x >= 0 || config5.predictable) {
          return x.pow(y);
        } else {
          return new Complex3(x.toNumber(), 0).pow(y.toNumber(), 0);
        }
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        if (y.d !== 1) {
          if (config5.predictable) {
            throw new Error("Function pow does not support non-integer exponents for fractions.");
          } else {
            return _pow(x.valueOf(), y.valueOf());
          }
        } else {
          return x.pow(y);
        }
      },
      "Array, number": _powArray,
      "Array, BigNumber": function ArrayBigNumber(x, y) {
        return _powArray(x, y.toNumber());
      },
      "Matrix, number": _powMatrix,
      "Matrix, BigNumber": function MatrixBigNumber(x, y) {
        return _powMatrix(x, y.toNumber());
      },
      "Unit, number | BigNumber": function UnitNumberBigNumber(x, y) {
        return x.pow(y);
      }
    });
    function _pow(x, y) {
      if (config5.predictable && !isInteger(y) && x < 0) {
        try {
          var yFrac = fraction3(y);
          var yNum = number50(yFrac);
          if (y === yNum || Math.abs((y - yNum) / y) < 1e-14) {
            if (yFrac.d % 2 === 1) {
              return (yFrac.n % 2 === 0 ? 1 : -1) * Math.pow(-x, y);
            }
          }
        } catch (ex) {
        }
      }
      if (config5.predictable && (x < -1 && y === Infinity || x > -1 && x < 0 && y === -Infinity)) {
        return NaN;
      }
      if (isInteger(y) || x >= 0 || config5.predictable) {
        return powNumber(x, y);
      } else {
        if (x * x < 1 && y === Infinity || x * x > 1 && y === -Infinity) {
          return 0;
        }
        return new Complex3(x, 0).pow(y, 0);
      }
    }
    function _powArray(x, y) {
      if (!isInteger(y) || y < 0) {
        throw new TypeError("For A^b, b must be a positive integer (value is " + y + ")");
      }
      var s = arraySize(x);
      if (s.length !== 2) {
        throw new Error("For A^b, A must be 2 dimensional (A has " + s.length + " dimensions)");
      }
      if (s[0] !== s[1]) {
        throw new Error("For A^b, A must be square (size is " + s[0] + "x" + s[1] + ")");
      }
      var res = identity2(s[0]).valueOf();
      var px = x;
      while (y >= 1) {
        if ((y & 1) === 1) {
          res = multiply2(px, res);
        }
        y >>= 1;
        px = multiply2(px, px);
      }
      return res;
    }
    function _powMatrix(x, y) {
      return matrix2(_powArray(x.valueOf(), y));
    }
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/round.js
  function ownKeys(object13, enumerableOnly) {
    var keys = Object.keys(object13);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object13);
      if (enumerableOnly)
        symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object13, sym).enumerable;
        });
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var NO_INT = "Number of decimals in function round must be an integer";
  var name54 = "round";
  var dependencies55 = ["typed", "matrix", "equalScalar", "zeros", "BigNumber", "DenseMatrix"];
  var createRound = /* @__PURE__ */ factory(name54, dependencies55, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      equalScalar: equalScalar2,
      zeros: zeros3,
      BigNumber: BigNumber2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm115 = createAlgorithm11({
      typed: typed2,
      equalScalar: equalScalar2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name54, _objectSpread(_objectSpread({}, roundNumberSignatures), {}, {
      Complex: function Complex3(x) {
        return x.round();
      },
      "Complex, number": function ComplexNumber(x, n) {
        if (n % 1) {
          throw new TypeError(NO_INT);
        }
        return x.round(n);
      },
      "Complex, BigNumber": function ComplexBigNumber(x, n) {
        if (!n.isInteger()) {
          throw new TypeError(NO_INT);
        }
        var _n = n.toNumber();
        return x.round(_n);
      },
      "number, BigNumber": function numberBigNumber(x, n) {
        if (!n.isInteger()) {
          throw new TypeError(NO_INT);
        }
        return new BigNumber2(x).toDecimalPlaces(n.toNumber());
      },
      BigNumber: function BigNumber3(x) {
        return x.toDecimalPlaces(0);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, n) {
        if (!n.isInteger()) {
          throw new TypeError(NO_INT);
        }
        return x.toDecimalPlaces(n.toNumber());
      },
      Fraction: function Fraction3(x) {
        return x.round();
      },
      "Fraction, number": function FractionNumber(x, n) {
        if (n % 1) {
          throw new TypeError(NO_INT);
        }
        return x.round(n);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      },
      "SparseMatrix, number | BigNumber": function SparseMatrixNumberBigNumber(x, y) {
        return algorithm115(x, y, this, false);
      },
      "DenseMatrix, number | BigNumber": function DenseMatrixNumberBigNumber(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "number | Complex | BigNumber, SparseMatrix": function numberComplexBigNumberSparseMatrix(x, y) {
        if (equalScalar2(x, 0)) {
          return zeros3(y.size(), y.storage());
        }
        return algorithm129(y, x, this, true);
      },
      "number | Complex | BigNumber, DenseMatrix": function numberComplexBigNumberDenseMatrix(x, y) {
        if (equalScalar2(x, 0)) {
          return zeros3(y.size(), y.storage());
        }
        return algorithm1415(y, x, this, true);
      },
      "Array, number | BigNumber": function ArrayNumberBigNumber(x, y) {
        return algorithm1415(matrix2(x), y, this, false).valueOf();
      },
      "number | Complex | BigNumber, Array": function numberComplexBigNumberArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    }));
  });
  var roundNumberSignatures = {
    number: roundNumber,
    "number, number": function numberNumber(x, n) {
      if (!isInteger(n)) {
        throw new TypeError(NO_INT);
      }
      if (n < 0 || n > 15) {
        throw new Error("Number of decimals in function round must be in te range of 0-15");
      }
      return roundNumber(x, n);
    }
  };

  // node_modules/mathjs/lib/esm/function/arithmetic/log.js
  var name55 = "log";
  var dependencies56 = ["config", "typed", "divideScalar", "Complex"];
  var createLog = /* @__PURE__ */ factory(name55, dependencies56, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      divideScalar: divideScalar2,
      Complex: Complex3
    } = _ref;
    return typed2(name55, {
      number: function number50(x) {
        if (x >= 0 || config5.predictable) {
          return logNumber(x);
        } else {
          return new Complex3(x, 0).log();
        }
      },
      Complex: function Complex4(x) {
        return x.log();
      },
      BigNumber: function BigNumber2(x) {
        if (!x.isNegative() || config5.predictable) {
          return x.ln();
        } else {
          return new Complex3(x.toNumber(), 0).log();
        }
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      },
      "any, any": function anyAny(x, base) {
        return divideScalar2(this(x), this(base));
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/log1p.js
  var name56 = "log1p";
  var dependencies57 = ["typed", "config", "divideScalar", "log", "Complex"];
  var createLog1p = /* @__PURE__ */ factory(name56, dependencies57, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      divideScalar: divideScalar2,
      log: log3,
      Complex: Complex3
    } = _ref;
    return typed2(name56, {
      number: function number50(x) {
        if (x >= -1 || config5.predictable) {
          return log1p(x);
        } else {
          return _log1pComplex(new Complex3(x, 0));
        }
      },
      Complex: _log1pComplex,
      BigNumber: function BigNumber2(x) {
        var y = x.plus(1);
        if (!y.isNegative() || config5.predictable) {
          return y.ln();
        } else {
          return _log1pComplex(new Complex3(x.toNumber(), 0));
        }
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      },
      "any, any": function anyAny(x, base) {
        return divideScalar2(this(x), log3(base));
      }
    });
    function _log1pComplex(x) {
      var xRe1p = x.re + 1;
      return new Complex3(Math.log(Math.sqrt(xRe1p * xRe1p + x.im * x.im)), Math.atan2(x.im, xRe1p));
    }
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/nthRoots.js
  var name57 = "nthRoots";
  var dependencies58 = ["config", "typed", "divideScalar", "Complex"];
  var createNthRoots = /* @__PURE__ */ factory(name57, dependencies58, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      divideScalar: divideScalar2,
      Complex: Complex3
    } = _ref;
    var _calculateExactResult = [function realPos(val) {
      return new Complex3(val, 0);
    }, function imagPos(val) {
      return new Complex3(0, val);
    }, function realNeg(val) {
      return new Complex3(-val, 0);
    }, function imagNeg(val) {
      return new Complex3(0, -val);
    }];
    function _nthComplexRoots(a, root) {
      if (root < 0)
        throw new Error("Root must be greater than zero");
      if (root === 0)
        throw new Error("Root must be non-zero");
      if (root % 1 !== 0)
        throw new Error("Root must be an integer");
      if (a === 0 || a.abs() === 0)
        return [new Complex3(0, 0)];
      var aIsNumeric = typeof a === "number";
      var offset;
      if (aIsNumeric || a.re === 0 || a.im === 0) {
        if (aIsNumeric) {
          offset = 2 * +(a < 0);
        } else if (a.im === 0) {
          offset = 2 * +(a.re < 0);
        } else {
          offset = 2 * +(a.im < 0) + 1;
        }
      }
      var arg = a.arg();
      var abs2 = a.abs();
      var roots = [];
      var r = Math.pow(abs2, 1 / root);
      for (var k = 0; k < root; k++) {
        var halfPiFactor = (offset + 4 * k) / root;
        if (halfPiFactor === Math.round(halfPiFactor)) {
          roots.push(_calculateExactResult[halfPiFactor % 4](r));
          continue;
        }
        roots.push(new Complex3({
          r,
          phi: (arg + 2 * Math.PI * k) / root
        }));
      }
      return roots;
    }
    return typed2(name57, {
      Complex: function Complex4(x) {
        return _nthComplexRoots(x, 2);
      },
      "Complex, number": _nthComplexRoots
    });
  });

  // node_modules/mathjs/lib/esm/function/relational/compare.js
  var name58 = "compare";
  var dependencies59 = ["typed", "config", "matrix", "equalScalar", "BigNumber", "Fraction", "DenseMatrix"];
  var createCompare = /* @__PURE__ */ factory(name58, dependencies59, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      equalScalar: equalScalar2,
      matrix: matrix2,
      BigNumber: BigNumber2,
      Fraction: Fraction3,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm053 = createAlgorithm05({
      typed: typed2,
      equalScalar: equalScalar2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name58, {
      "boolean, boolean": function booleanBoolean(x, y) {
        return x === y ? 0 : x > y ? 1 : -1;
      },
      "number, number": function numberNumber2(x, y) {
        return nearlyEqual(x, y, config5.epsilon) ? 0 : x > y ? 1 : -1;
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return nearlyEqual2(x, y, config5.epsilon) ? new BigNumber2(0) : new BigNumber2(x.cmp(y));
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return new Fraction3(x.compare(y));
      },
      "Complex, Complex": function ComplexComplex() {
        throw new TypeError("No ordering relation is defined for complex numbers");
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (!x.equalBase(y)) {
          throw new Error("Cannot compare units with different base");
        }
        return this(x.value, y.value);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm053(x, y, this);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm039(y, x, this, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm039(x, y, this, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, this);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm129(x, y, this, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm129(y, x, this, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, this, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, this, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/relational/equal.js
  var name59 = "equal";
  var dependencies60 = ["typed", "matrix", "equalScalar", "DenseMatrix"];
  var createEqual = /* @__PURE__ */ factory(name59, dependencies60, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      equalScalar: equalScalar2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm077 = createAlgorithm07({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name59, {
      "any, any": function anyAny(x, y) {
        if (x === null) {
          return y === null;
        }
        if (y === null) {
          return x === null;
        }
        if (x === void 0) {
          return y === void 0;
        }
        if (y === void 0) {
          return x === void 0;
        }
        return equalScalar2(x, y);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm077(x, y, equalScalar2);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm039(y, x, equalScalar2, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm039(x, y, equalScalar2, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, equalScalar2);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm129(x, y, equalScalar2, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, equalScalar2, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm129(y, x, equalScalar2, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, equalScalar2, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, equalScalar2, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, equalScalar2, true).valueOf();
      }
    });
  });
  var createEqualNumber = factory(name59, ["typed", "equalScalar"], (_ref2) => {
    var {
      typed: typed2,
      equalScalar: equalScalar2
    } = _ref2;
    return typed2(name59, {
      "any, any": function anyAny(x, y) {
        if (x === null) {
          return y === null;
        }
        if (y === null) {
          return x === null;
        }
        if (x === void 0) {
          return y === void 0;
        }
        if (y === void 0) {
          return x === void 0;
        }
        return equalScalar2(x, y);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/relational/smaller.js
  var name60 = "smaller";
  var dependencies61 = ["typed", "config", "matrix", "DenseMatrix"];
  var createSmaller = /* @__PURE__ */ factory(name60, dependencies61, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm077 = createAlgorithm07({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name60, {
      "boolean, boolean": function booleanBoolean(x, y) {
        return x < y;
      },
      "number, number": function numberNumber2(x, y) {
        return x < y && !nearlyEqual(x, y, config5.epsilon);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.lt(y) && !nearlyEqual2(x, y, config5.epsilon);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.compare(y) === -1;
      },
      "Complex, Complex": function ComplexComplex(x, y) {
        throw new TypeError("No ordering relation is defined for complex numbers");
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (!x.equalBase(y)) {
          throw new Error("Cannot compare units with different base");
        }
        return this(x.value, y.value);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm077(x, y, this);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm039(y, x, this, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm039(x, y, this, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, this);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm129(x, y, this, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm129(y, x, this, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, this, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, this, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/relational/smallerEq.js
  var name61 = "smallerEq";
  var dependencies62 = ["typed", "config", "matrix", "DenseMatrix"];
  var createSmallerEq = /* @__PURE__ */ factory(name61, dependencies62, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm077 = createAlgorithm07({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name61, {
      "boolean, boolean": function booleanBoolean(x, y) {
        return x <= y;
      },
      "number, number": function numberNumber2(x, y) {
        return x <= y || nearlyEqual(x, y, config5.epsilon);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.lte(y) || nearlyEqual2(x, y, config5.epsilon);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.compare(y) !== 1;
      },
      "Complex, Complex": function ComplexComplex() {
        throw new TypeError("No ordering relation is defined for complex numbers");
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (!x.equalBase(y)) {
          throw new Error("Cannot compare units with different base");
        }
        return this(x.value, y.value);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm077(x, y, this);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm039(y, x, this, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm039(x, y, this, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, this);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm129(x, y, this, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm129(y, x, this, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, this, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, this, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/relational/larger.js
  var name62 = "larger";
  var dependencies63 = ["typed", "config", "matrix", "DenseMatrix"];
  var createLarger = /* @__PURE__ */ factory(name62, dependencies63, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm077 = createAlgorithm07({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name62, {
      "boolean, boolean": function booleanBoolean(x, y) {
        return x > y;
      },
      "number, number": function numberNumber2(x, y) {
        return x > y && !nearlyEqual(x, y, config5.epsilon);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.gt(y) && !nearlyEqual2(x, y, config5.epsilon);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.compare(y) === 1;
      },
      "Complex, Complex": function ComplexComplex() {
        throw new TypeError("No ordering relation is defined for complex numbers");
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (!x.equalBase(y)) {
          throw new Error("Cannot compare units with different base");
        }
        return this(x.value, y.value);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm077(x, y, this);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm039(y, x, this, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm039(x, y, this, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, this);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm129(x, y, this, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm129(y, x, this, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, this, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, this, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/relational/largerEq.js
  var name63 = "largerEq";
  var dependencies64 = ["typed", "config", "matrix", "DenseMatrix"];
  var createLargerEq = /* @__PURE__ */ factory(name63, dependencies64, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      matrix: matrix2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm077 = createAlgorithm07({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name63, {
      "boolean, boolean": function booleanBoolean(x, y) {
        return x >= y;
      },
      "number, number": function numberNumber2(x, y) {
        return x >= y || nearlyEqual(x, y, config5.epsilon);
      },
      "BigNumber, BigNumber": function BigNumberBigNumber(x, y) {
        return x.gte(y) || nearlyEqual2(x, y, config5.epsilon);
      },
      "Fraction, Fraction": function FractionFraction(x, y) {
        return x.compare(y) !== -1;
      },
      "Complex, Complex": function ComplexComplex() {
        throw new TypeError("No ordering relation is defined for complex numbers");
      },
      "Unit, Unit": function UnitUnit(x, y) {
        if (!x.equalBase(y)) {
          throw new Error("Cannot compare units with different base");
        }
        return this(x.value, y.value);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm077(x, y, this);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm039(y, x, this, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm039(x, y, this, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, this);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm129(x, y, this, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, this, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm129(y, x, this, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, this, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, this, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, this, true).valueOf();
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/relational/unequal.js
  var name64 = "unequal";
  var dependencies65 = ["typed", "config", "equalScalar", "matrix", "DenseMatrix"];
  var createUnequal = /* @__PURE__ */ factory(name64, dependencies65, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      equalScalar: equalScalar2,
      matrix: matrix2,
      DenseMatrix: DenseMatrix2
    } = _ref;
    var algorithm039 = createAlgorithm03({
      typed: typed2
    });
    var algorithm077 = createAlgorithm07({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm129 = createAlgorithm12({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2("unequal", {
      "any, any": function anyAny(x, y) {
        if (x === null) {
          return y !== null;
        }
        if (y === null) {
          return x !== null;
        }
        if (x === void 0) {
          return y !== void 0;
        }
        if (y === void 0) {
          return x !== void 0;
        }
        return _unequal(x, y);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm077(x, y, _unequal);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm039(y, x, _unequal, true);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm039(x, y, _unequal, false);
      },
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, _unequal);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm129(x, y, _unequal, false);
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, _unequal, false);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm129(y, x, _unequal, true);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, _unequal, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, _unequal, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, _unequal, true).valueOf();
      }
    });
    function _unequal(x, y) {
      return !equalScalar2(x, y);
    }
  });
  var createUnequalNumber = factory(name64, ["typed", "equalScalar"], (_ref2) => {
    var {
      typed: typed2,
      equalScalar: equalScalar2
    } = _ref2;
    return typed2(name64, {
      "any, any": function anyAny(x, y) {
        if (x === null) {
          return y !== null;
        }
        if (y === null) {
          return x !== null;
        }
        if (x === void 0) {
          return y !== void 0;
        }
        if (y === void 0) {
          return x !== void 0;
        }
        return !equalScalar2(x, y);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/statistics/max.js
  var name65 = "max";
  var dependencies66 = ["typed", "config", "numeric", "larger"];
  var createMax = /* @__PURE__ */ factory(name65, dependencies66, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      numeric: numeric2,
      larger: larger2
    } = _ref;
    return typed2(name65, {
      "Array | Matrix": _max,
      "Array | Matrix, number | BigNumber": function ArrayMatrixNumberBigNumber(array13, dim) {
        return reduce(array13, dim.valueOf(), _largest);
      },
      "...": function _(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function max");
        }
        return _max(args);
      }
    });
    function _largest(x, y) {
      try {
        return larger2(x, y) ? x : y;
      } catch (err) {
        throw improveErrorMessage(err, "max", y);
      }
    }
    function _max(array13) {
      var res;
      deepForEach(array13, function(value) {
        try {
          if (isNaN(value) && typeof value === "number") {
            res = NaN;
          } else if (res === void 0 || larger2(value, res)) {
            res = value;
          }
        } catch (err) {
          throw improveErrorMessage(err, "max", value);
        }
      });
      if (res === void 0) {
        throw new Error("Cannot calculate max of an empty array");
      }
      if (typeof res === "string") {
        res = numeric2(res, config5.number);
      }
      return res;
    }
  });

  // node_modules/mathjs/lib/esm/function/statistics/min.js
  var name66 = "min";
  var dependencies67 = ["typed", "config", "numeric", "smaller"];
  var createMin = /* @__PURE__ */ factory(name66, dependencies67, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      numeric: numeric2,
      smaller: smaller2
    } = _ref;
    return typed2(name66, {
      "Array | Matrix": _min,
      "Array | Matrix, number | BigNumber": function ArrayMatrixNumberBigNumber(array13, dim) {
        return reduce(array13, dim.valueOf(), _smallest);
      },
      "...": function _(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function min");
        }
        return _min(args);
      }
    });
    function _smallest(x, y) {
      try {
        return smaller2(x, y) ? x : y;
      } catch (err) {
        throw improveErrorMessage(err, "min", y);
      }
    }
    function _min(array13) {
      var min2;
      deepForEach(array13, function(value) {
        try {
          if (isNaN(value) && typeof value === "number") {
            min2 = NaN;
          } else if (min2 === void 0 || smaller2(value, min2)) {
            min2 = value;
          }
        } catch (err) {
          throw improveErrorMessage(err, "min", value);
        }
      });
      if (min2 === void 0) {
        throw new Error("Cannot calculate min of an empty array");
      }
      if (typeof min2 === "string") {
        min2 = numeric2(min2, config5.number);
      }
      return min2;
    }
  });

  // node_modules/mathjs/lib/esm/type/matrix/FibonacciHeap.js
  var name67 = "FibonacciHeap";
  var dependencies68 = ["smaller", "larger"];
  var createFibonacciHeapClass = /* @__PURE__ */ factory(name67, dependencies68, (_ref) => {
    var {
      smaller: smaller2,
      larger: larger2
    } = _ref;
    var oneOverLogPhi = 1 / Math.log((1 + Math.sqrt(5)) / 2);
    function FibonacciHeap2() {
      if (!(this instanceof FibonacciHeap2)) {
        throw new SyntaxError("Constructor must be called with the new operator");
      }
      this._minimum = null;
      this._size = 0;
    }
    FibonacciHeap2.prototype.type = "FibonacciHeap";
    FibonacciHeap2.prototype.isFibonacciHeap = true;
    FibonacciHeap2.prototype.insert = function(key, value) {
      var node = {
        key,
        value,
        degree: 0
      };
      if (this._minimum) {
        var minimum = this._minimum;
        node.left = minimum;
        node.right = minimum.right;
        minimum.right = node;
        node.right.left = node;
        if (smaller2(key, minimum.key)) {
          this._minimum = node;
        }
      } else {
        node.left = node;
        node.right = node;
        this._minimum = node;
      }
      this._size++;
      return node;
    };
    FibonacciHeap2.prototype.size = function() {
      return this._size;
    };
    FibonacciHeap2.prototype.clear = function() {
      this._minimum = null;
      this._size = 0;
    };
    FibonacciHeap2.prototype.isEmpty = function() {
      return this._size === 0;
    };
    FibonacciHeap2.prototype.extractMinimum = function() {
      var node = this._minimum;
      if (node === null) {
        return node;
      }
      var minimum = this._minimum;
      var numberOfChildren = node.degree;
      var x = node.child;
      while (numberOfChildren > 0) {
        var tempRight = x.right;
        x.left.right = x.right;
        x.right.left = x.left;
        x.left = minimum;
        x.right = minimum.right;
        minimum.right = x;
        x.right.left = x;
        x.parent = null;
        x = tempRight;
        numberOfChildren--;
      }
      node.left.right = node.right;
      node.right.left = node.left;
      if (node === node.right) {
        minimum = null;
      } else {
        minimum = node.right;
        minimum = _findMinimumNode(minimum, this._size);
      }
      this._size--;
      this._minimum = minimum;
      return node;
    };
    FibonacciHeap2.prototype.remove = function(node) {
      this._minimum = _decreaseKey(this._minimum, node, -1);
      this.extractMinimum();
    };
    function _decreaseKey(minimum, node, key) {
      node.key = key;
      var parent = node.parent;
      if (parent && smaller2(node.key, parent.key)) {
        _cut(minimum, node, parent);
        _cascadingCut(minimum, parent);
      }
      if (smaller2(node.key, minimum.key)) {
        minimum = node;
      }
      return minimum;
    }
    function _cut(minimum, node, parent) {
      node.left.right = node.right;
      node.right.left = node.left;
      parent.degree--;
      if (parent.child === node) {
        parent.child = node.right;
      }
      if (parent.degree === 0) {
        parent.child = null;
      }
      node.left = minimum;
      node.right = minimum.right;
      minimum.right = node;
      node.right.left = node;
      node.parent = null;
      node.mark = false;
    }
    function _cascadingCut(minimum, node) {
      var parent = node.parent;
      if (!parent) {
        return;
      }
      if (!node.mark) {
        node.mark = true;
      } else {
        _cut(minimum, node, parent);
        _cascadingCut(parent);
      }
    }
    var _linkNodes = function _linkNodes2(node, parent) {
      node.left.right = node.right;
      node.right.left = node.left;
      node.parent = parent;
      if (!parent.child) {
        parent.child = node;
        node.right = node;
        node.left = node;
      } else {
        node.left = parent.child;
        node.right = parent.child.right;
        parent.child.right = node;
        node.right.left = node;
      }
      parent.degree++;
      node.mark = false;
    };
    function _findMinimumNode(minimum, size2) {
      var arraySize2 = Math.floor(Math.log(size2) * oneOverLogPhi) + 1;
      var array13 = new Array(arraySize2);
      var numRoots = 0;
      var x = minimum;
      if (x) {
        numRoots++;
        x = x.right;
        while (x !== minimum) {
          numRoots++;
          x = x.right;
        }
      }
      var y;
      while (numRoots > 0) {
        var d = x.degree;
        var next = x.right;
        while (true) {
          y = array13[d];
          if (!y) {
            break;
          }
          if (larger2(x.key, y.key)) {
            var temp = y;
            y = x;
            x = temp;
          }
          _linkNodes(y, x);
          array13[d] = null;
          d++;
        }
        array13[d] = x;
        x = next;
        numRoots--;
      }
      minimum = null;
      for (var i = 0; i < arraySize2; i++) {
        y = array13[i];
        if (!y) {
          continue;
        }
        if (minimum) {
          y.left.right = y.right;
          y.right.left = y.left;
          y.left = minimum;
          y.right = minimum.right;
          minimum.right = y;
          y.right.left = y;
          if (smaller2(y.key, minimum.key)) {
            minimum = y;
          }
        } else {
          minimum = y;
        }
      }
      return minimum;
    }
    return FibonacciHeap2;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/type/matrix/Spa.js
  var name68 = "Spa";
  var dependencies69 = ["addScalar", "equalScalar", "FibonacciHeap"];
  var createSpaClass = /* @__PURE__ */ factory(name68, dependencies69, (_ref) => {
    var {
      addScalar: addScalar2,
      equalScalar: equalScalar2,
      FibonacciHeap: FibonacciHeap2
    } = _ref;
    function Spa2() {
      if (!(this instanceof Spa2)) {
        throw new SyntaxError("Constructor must be called with the new operator");
      }
      this._values = [];
      this._heap = new FibonacciHeap2();
    }
    Spa2.prototype.type = "Spa";
    Spa2.prototype.isSpa = true;
    Spa2.prototype.set = function(i, v) {
      if (!this._values[i]) {
        var node = this._heap.insert(i, v);
        this._values[i] = node;
      } else {
        this._values[i].value = v;
      }
    };
    Spa2.prototype.get = function(i) {
      var node = this._values[i];
      if (node) {
        return node.value;
      }
      return 0;
    };
    Spa2.prototype.accumulate = function(i, v) {
      var node = this._values[i];
      if (!node) {
        node = this._heap.insert(i, v);
        this._values[i] = node;
      } else {
        node.value = addScalar2(node.value, v);
      }
    };
    Spa2.prototype.forEach = function(from, to, callback) {
      var heap = this._heap;
      var values = this._values;
      var nodes = [];
      var node = heap.extractMinimum();
      if (node) {
        nodes.push(node);
      }
      while (node && node.key <= to) {
        if (node.key >= from) {
          if (!equalScalar2(node.value, 0)) {
            callback(node.key, node.value, this);
          }
        }
        node = heap.extractMinimum();
        if (node) {
          nodes.push(node);
        }
      }
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        node = heap.insert(n.key, n.value);
        values[node.key] = node;
      }
    };
    Spa2.prototype.swap = function(i, j) {
      var nodei = this._values[i];
      var nodej = this._values[j];
      if (!nodei && nodej) {
        nodei = this._heap.insert(i, nodej.value);
        this._heap.remove(nodej);
        this._values[i] = nodei;
        this._values[j] = void 0;
      } else if (nodei && !nodej) {
        nodej = this._heap.insert(j, nodei.value);
        this._heap.remove(nodei);
        this._values[j] = nodej;
        this._values[i] = void 0;
      } else if (nodei && nodej) {
        var v = nodei.value;
        nodei.value = nodej.value;
        nodej.value = v;
      }
    };
    return Spa2;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/utils/bignumber/constants.js
  var createBigNumberE = memoize(function(BigNumber2) {
    return new BigNumber2(1).exp();
  }, hasher);
  var createBigNumberPhi = memoize(function(BigNumber2) {
    return new BigNumber2(1).plus(new BigNumber2(5).sqrt()).div(2);
  }, hasher);
  var createBigNumberPi = memoize(function(BigNumber2) {
    return BigNumber2.acos(-1);
  }, hasher);
  var createBigNumberTau = memoize(function(BigNumber2) {
    return createBigNumberPi(BigNumber2).times(2);
  }, hasher);
  function hasher(args) {
    return args[0].precision;
  }

  // node_modules/mathjs/lib/esm/type/unit/Unit.js
  function _extends2() {
    _extends2 = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends2.apply(this, arguments);
  }
  function ownKeys2(object13, enumerableOnly) {
    var keys = Object.keys(object13);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object13);
      if (enumerableOnly)
        symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object13, sym).enumerable;
        });
      keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      if (i % 2) {
        ownKeys2(Object(source), true).forEach(function(key) {
          _defineProperty2(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys2(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }
    return target;
  }
  function _defineProperty2(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {value, enumerable: true, configurable: true, writable: true});
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var name69 = "Unit";
  var dependencies70 = ["?on", "config", "addScalar", "subtract", "multiplyScalar", "divideScalar", "pow", "abs", "fix", "round", "equal", "isNumeric", "format", "number", "Complex", "BigNumber", "Fraction"];
  var createUnitClass = /* @__PURE__ */ factory(name69, dependencies70, (_ref) => {
    var {
      on,
      config: config5,
      addScalar: addScalar2,
      subtract: subtract2,
      multiplyScalar: multiplyScalar2,
      divideScalar: divideScalar2,
      pow: pow2,
      abs: abs2,
      fix: fix2,
      round: round2,
      equal: equal2,
      isNumeric: isNumeric2,
      format: format5,
      number: number50,
      Complex: Complex3,
      BigNumber: _BigNumber,
      Fraction: _Fraction
    } = _ref;
    var toNumber = number50;
    function Unit2(value, name94) {
      if (!(this instanceof Unit2)) {
        throw new Error("Constructor must be called with the new operator");
      }
      if (!(value === null || value === void 0 || isNumeric2(value) || isComplex(value))) {
        throw new TypeError("First parameter in Unit constructor must be number, BigNumber, Fraction, Complex, or undefined");
      }
      if (name94 !== void 0 && (typeof name94 !== "string" || name94 === "")) {
        throw new TypeError("Second parameter in Unit constructor must be a string");
      }
      if (name94 !== void 0) {
        var u = Unit2.parse(name94);
        this.units = u.units;
        this.dimensions = u.dimensions;
      } else {
        this.units = [{
          unit: UNIT_NONE,
          prefix: PREFIXES.NONE,
          power: 0
        }];
        this.dimensions = [];
        for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
          this.dimensions[i] = 0;
        }
      }
      this.value = value !== void 0 && value !== null ? this._normalize(value) : null;
      this.fixPrefix = false;
      this.skipAutomaticSimplification = true;
    }
    Unit2.prototype.type = "Unit";
    Unit2.prototype.isUnit = true;
    var text, index, c;
    function skipWhitespace() {
      while (c === " " || c === "	") {
        next();
      }
    }
    function isDigitDot(c2) {
      return c2 >= "0" && c2 <= "9" || c2 === ".";
    }
    function isDigit(c2) {
      return c2 >= "0" && c2 <= "9";
    }
    function next() {
      index++;
      c = text.charAt(index);
    }
    function revert(oldIndex) {
      index = oldIndex;
      c = text.charAt(index);
    }
    function parseNumber() {
      var number51 = "";
      var oldIndex = index;
      if (c === "+") {
        next();
      } else if (c === "-") {
        number51 += c;
        next();
      }
      if (!isDigitDot(c)) {
        revert(oldIndex);
        return null;
      }
      if (c === ".") {
        number51 += c;
        next();
        if (!isDigit(c)) {
          revert(oldIndex);
          return null;
        }
      } else {
        while (isDigit(c)) {
          number51 += c;
          next();
        }
        if (c === ".") {
          number51 += c;
          next();
        }
      }
      while (isDigit(c)) {
        number51 += c;
        next();
      }
      if (c === "E" || c === "e") {
        var tentativeNumber = "";
        var tentativeIndex = index;
        tentativeNumber += c;
        next();
        if (c === "+" || c === "-") {
          tentativeNumber += c;
          next();
        }
        if (!isDigit(c)) {
          revert(tentativeIndex);
          return number51;
        }
        number51 = number51 + tentativeNumber;
        while (isDigit(c)) {
          number51 += c;
          next();
        }
      }
      return number51;
    }
    function parseUnit() {
      var unitName = "";
      while (isDigit(c) || Unit2.isValidAlpha(c)) {
        unitName += c;
        next();
      }
      var firstC = unitName.charAt(0);
      if (Unit2.isValidAlpha(firstC)) {
        return unitName;
      } else {
        return null;
      }
    }
    function parseCharacter(toFind) {
      if (c === toFind) {
        next();
        return toFind;
      } else {
        return null;
      }
    }
    Unit2.parse = function(str, options) {
      options = options || {};
      text = str;
      index = -1;
      c = "";
      if (typeof text !== "string") {
        throw new TypeError("Invalid argument in Unit.parse, string expected");
      }
      var unit2 = new Unit2();
      unit2.units = [];
      var powerMultiplierCurrent = 1;
      var expectingUnit = false;
      next();
      skipWhitespace();
      var valueStr = parseNumber();
      var value = null;
      if (valueStr) {
        if (config5.number === "BigNumber") {
          value = new _BigNumber(valueStr);
        } else if (config5.number === "Fraction") {
          try {
            value = new _Fraction(valueStr);
          } catch (err) {
            value = parseFloat(valueStr);
          }
        } else {
          value = parseFloat(valueStr);
        }
        skipWhitespace();
        if (parseCharacter("*")) {
          powerMultiplierCurrent = 1;
          expectingUnit = true;
        } else if (parseCharacter("/")) {
          powerMultiplierCurrent = -1;
          expectingUnit = true;
        }
      }
      var powerMultiplierStack = [];
      var powerMultiplierStackProduct = 1;
      while (true) {
        skipWhitespace();
        while (c === "(") {
          powerMultiplierStack.push(powerMultiplierCurrent);
          powerMultiplierStackProduct *= powerMultiplierCurrent;
          powerMultiplierCurrent = 1;
          next();
          skipWhitespace();
        }
        var uStr = void 0;
        if (c) {
          var oldC = c;
          uStr = parseUnit();
          if (uStr === null) {
            throw new SyntaxError('Unexpected "' + oldC + '" in "' + text + '" at index ' + index.toString());
          }
        } else {
          break;
        }
        var res = _findUnit(uStr);
        if (res === null) {
          throw new SyntaxError('Unit "' + uStr + '" not found.');
        }
        var power = powerMultiplierCurrent * powerMultiplierStackProduct;
        skipWhitespace();
        if (parseCharacter("^")) {
          skipWhitespace();
          var p = parseNumber();
          if (p === null) {
            throw new SyntaxError('In "' + str + '", "^" must be followed by a floating-point number');
          }
          power *= p;
        }
        unit2.units.push({
          unit: res.unit,
          prefix: res.prefix,
          power
        });
        for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
          unit2.dimensions[i] += (res.unit.dimensions[i] || 0) * power;
        }
        skipWhitespace();
        while (c === ")") {
          if (powerMultiplierStack.length === 0) {
            throw new SyntaxError('Unmatched ")" in "' + text + '" at index ' + index.toString());
          }
          powerMultiplierStackProduct /= powerMultiplierStack.pop();
          next();
          skipWhitespace();
        }
        expectingUnit = false;
        if (parseCharacter("*")) {
          powerMultiplierCurrent = 1;
          expectingUnit = true;
        } else if (parseCharacter("/")) {
          powerMultiplierCurrent = -1;
          expectingUnit = true;
        } else {
          powerMultiplierCurrent = 1;
        }
        if (res.unit.base) {
          var baseDim = res.unit.base.key;
          UNIT_SYSTEMS.auto[baseDim] = {
            unit: res.unit,
            prefix: res.prefix
          };
        }
      }
      skipWhitespace();
      if (c) {
        throw new SyntaxError('Could not parse: "' + str + '"');
      }
      if (expectingUnit) {
        throw new SyntaxError('Trailing characters: "' + str + '"');
      }
      if (powerMultiplierStack.length !== 0) {
        throw new SyntaxError('Unmatched "(" in "' + text + '"');
      }
      if (unit2.units.length === 0 && !options.allowNoUnits) {
        throw new SyntaxError('"' + str + '" contains no units');
      }
      unit2.value = value !== void 0 ? unit2._normalize(value) : null;
      return unit2;
    };
    Unit2.prototype.clone = function() {
      var unit2 = new Unit2();
      unit2.fixPrefix = this.fixPrefix;
      unit2.skipAutomaticSimplification = this.skipAutomaticSimplification;
      unit2.value = clone(this.value);
      unit2.dimensions = this.dimensions.slice(0);
      unit2.units = [];
      for (var i = 0; i < this.units.length; i++) {
        unit2.units[i] = {};
        for (var p in this.units[i]) {
          if (hasOwnProperty(this.units[i], p)) {
            unit2.units[i][p] = this.units[i][p];
          }
        }
      }
      return unit2;
    };
    Unit2.prototype._isDerived = function() {
      if (this.units.length === 0) {
        return false;
      }
      return this.units.length > 1 || Math.abs(this.units[0].power - 1) > 1e-15;
    };
    Unit2.prototype._normalize = function(value) {
      var unitValue, unitOffset, unitPower, unitPrefixValue;
      var convert;
      if (value === null || value === void 0 || this.units.length === 0) {
        return value;
      } else if (this._isDerived()) {
        var res = value;
        convert = Unit2._getNumberConverter(typeOf(value));
        for (var i = 0; i < this.units.length; i++) {
          unitValue = convert(this.units[i].unit.value);
          unitPrefixValue = convert(this.units[i].prefix.value);
          unitPower = convert(this.units[i].power);
          res = multiplyScalar2(res, pow2(multiplyScalar2(unitValue, unitPrefixValue), unitPower));
        }
        return res;
      } else {
        convert = Unit2._getNumberConverter(typeOf(value));
        unitValue = convert(this.units[0].unit.value);
        unitOffset = convert(this.units[0].unit.offset);
        unitPrefixValue = convert(this.units[0].prefix.value);
        return multiplyScalar2(addScalar2(value, unitOffset), multiplyScalar2(unitValue, unitPrefixValue));
      }
    };
    Unit2.prototype._denormalize = function(value, prefixValue) {
      var unitValue, unitOffset, unitPower, unitPrefixValue;
      var convert;
      if (value === null || value === void 0 || this.units.length === 0) {
        return value;
      } else if (this._isDerived()) {
        var res = value;
        convert = Unit2._getNumberConverter(typeOf(value));
        for (var i = 0; i < this.units.length; i++) {
          unitValue = convert(this.units[i].unit.value);
          unitPrefixValue = convert(this.units[i].prefix.value);
          unitPower = convert(this.units[i].power);
          res = divideScalar2(res, pow2(multiplyScalar2(unitValue, unitPrefixValue), unitPower));
        }
        return res;
      } else {
        convert = Unit2._getNumberConverter(typeOf(value));
        unitValue = convert(this.units[0].unit.value);
        unitPrefixValue = convert(this.units[0].prefix.value);
        unitOffset = convert(this.units[0].unit.offset);
        if (prefixValue === void 0 || prefixValue === null) {
          return subtract2(divideScalar2(divideScalar2(value, unitValue), unitPrefixValue), unitOffset);
        } else {
          return subtract2(divideScalar2(divideScalar2(value, unitValue), prefixValue), unitOffset);
        }
      }
    };
    function _findUnit(str) {
      if (hasOwnProperty(UNITS, str)) {
        var unit2 = UNITS[str];
        var prefix = unit2.prefixes[""];
        return {
          unit: unit2,
          prefix
        };
      }
      for (var _name in UNITS) {
        if (hasOwnProperty(UNITS, _name)) {
          if (endsWith(str, _name)) {
            var _unit = UNITS[_name];
            var prefixLen = str.length - _name.length;
            var prefixName = str.substring(0, prefixLen);
            var _prefix = hasOwnProperty(_unit.prefixes, prefixName) ? _unit.prefixes[prefixName] : void 0;
            if (_prefix !== void 0) {
              return {
                unit: _unit,
                prefix: _prefix
              };
            }
          }
        }
      }
      return null;
    }
    Unit2.isValuelessUnit = function(name94) {
      return _findUnit(name94) !== null;
    };
    Unit2.prototype.hasBase = function(base) {
      if (typeof base === "string") {
        base = BASE_UNITS[base];
      }
      if (!base) {
        return false;
      }
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        if (Math.abs((this.dimensions[i] || 0) - (base.dimensions[i] || 0)) > 1e-12) {
          return false;
        }
      }
      return true;
    };
    Unit2.prototype.equalBase = function(other) {
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        if (Math.abs((this.dimensions[i] || 0) - (other.dimensions[i] || 0)) > 1e-12) {
          return false;
        }
      }
      return true;
    };
    Unit2.prototype.equals = function(other) {
      return this.equalBase(other) && equal2(this.value, other.value);
    };
    Unit2.prototype.multiply = function(other) {
      var res = this.clone();
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        res.dimensions[i] = (this.dimensions[i] || 0) + (other.dimensions[i] || 0);
      }
      for (var _i = 0; _i < other.units.length; _i++) {
        var inverted = _objectSpread2({}, other.units[_i]);
        res.units.push(inverted);
      }
      if (this.value !== null || other.value !== null) {
        var valThis = this.value === null ? this._normalize(1) : this.value;
        var valOther = other.value === null ? other._normalize(1) : other.value;
        res.value = multiplyScalar2(valThis, valOther);
      } else {
        res.value = null;
      }
      res.skipAutomaticSimplification = false;
      return getNumericIfUnitless(res);
    };
    Unit2.prototype.divide = function(other) {
      var res = this.clone();
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        res.dimensions[i] = (this.dimensions[i] || 0) - (other.dimensions[i] || 0);
      }
      for (var _i2 = 0; _i2 < other.units.length; _i2++) {
        var inverted = _objectSpread2(_objectSpread2({}, other.units[_i2]), {}, {
          power: -other.units[_i2].power
        });
        res.units.push(inverted);
      }
      if (this.value !== null || other.value !== null) {
        var valThis = this.value === null ? this._normalize(1) : this.value;
        var valOther = other.value === null ? other._normalize(1) : other.value;
        res.value = divideScalar2(valThis, valOther);
      } else {
        res.value = null;
      }
      res.skipAutomaticSimplification = false;
      return getNumericIfUnitless(res);
    };
    Unit2.prototype.pow = function(p) {
      var res = this.clone();
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        res.dimensions[i] = (this.dimensions[i] || 0) * p;
      }
      for (var _i3 = 0; _i3 < res.units.length; _i3++) {
        res.units[_i3].power *= p;
      }
      if (res.value !== null) {
        res.value = pow2(res.value, p);
      } else {
        res.value = null;
      }
      res.skipAutomaticSimplification = false;
      return getNumericIfUnitless(res);
    };
    function getNumericIfUnitless(unit2) {
      if (unit2.equalBase(BASE_UNITS.NONE) && unit2.value !== null && !config5.predictable) {
        return unit2.value;
      } else {
        return unit2;
      }
    }
    Unit2.prototype.abs = function() {
      var ret = this.clone();
      ret.value = ret.value !== null ? abs2(ret.value) : null;
      for (var i in ret.units) {
        if (ret.units[i].unit.name === "VA" || ret.units[i].unit.name === "VAR") {
          ret.units[i].unit = UNITS.W;
        }
      }
      return ret;
    };
    Unit2.prototype.to = function(valuelessUnit) {
      var other;
      var value = this.value === null ? this._normalize(1) : this.value;
      if (typeof valuelessUnit === "string") {
        other = Unit2.parse(valuelessUnit);
        if (!this.equalBase(other)) {
          throw new Error("Units do not match ('".concat(other.toString(), "' != '").concat(this.toString(), "')"));
        }
        if (other.value !== null) {
          throw new Error("Cannot convert to a unit with a value");
        }
        other.value = clone(value);
        other.fixPrefix = true;
        other.skipAutomaticSimplification = true;
        return other;
      } else if (isUnit(valuelessUnit)) {
        if (!this.equalBase(valuelessUnit)) {
          throw new Error("Units do not match ('".concat(valuelessUnit.toString(), "' != '").concat(this.toString(), "')"));
        }
        if (valuelessUnit.value !== null) {
          throw new Error("Cannot convert to a unit with a value");
        }
        other = valuelessUnit.clone();
        other.value = clone(value);
        other.fixPrefix = true;
        other.skipAutomaticSimplification = true;
        return other;
      } else {
        throw new Error("String or Unit expected as parameter");
      }
    };
    Unit2.prototype.toNumber = function(valuelessUnit) {
      return toNumber(this.toNumeric(valuelessUnit));
    };
    Unit2.prototype.toNumeric = function(valuelessUnit) {
      var other;
      if (valuelessUnit) {
        other = this.to(valuelessUnit);
      } else {
        other = this.clone();
      }
      if (other._isDerived() || other.units.length === 0) {
        return other._denormalize(other.value);
      } else {
        return other._denormalize(other.value, other.units[0].prefix.value);
      }
    };
    Unit2.prototype.toString = function() {
      return this.format();
    };
    Unit2.prototype.toJSON = function() {
      return {
        mathjs: "Unit",
        value: this._denormalize(this.value),
        unit: this.formatUnits(),
        fixPrefix: this.fixPrefix
      };
    };
    Unit2.fromJSON = function(json) {
      var unit2 = new Unit2(json.value, json.unit);
      unit2.fixPrefix = json.fixPrefix || false;
      return unit2;
    };
    Unit2.prototype.valueOf = Unit2.prototype.toString;
    Unit2.prototype.simplify = function() {
      var ret = this.clone();
      var proposedUnitList = [];
      var matchingBase;
      for (var key2 in currentUnitSystem) {
        if (hasOwnProperty(currentUnitSystem, key2)) {
          if (ret.hasBase(BASE_UNITS[key2])) {
            matchingBase = key2;
            break;
          }
        }
      }
      if (matchingBase === "NONE") {
        ret.units = [];
      } else {
        var matchingUnit;
        if (matchingBase) {
          if (hasOwnProperty(currentUnitSystem, matchingBase)) {
            matchingUnit = currentUnitSystem[matchingBase];
          }
        }
        if (matchingUnit) {
          ret.units = [{
            unit: matchingUnit.unit,
            prefix: matchingUnit.prefix,
            power: 1
          }];
        } else {
          var missingBaseDim = false;
          for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
            var baseDim = BASE_DIMENSIONS[i];
            if (Math.abs(ret.dimensions[i] || 0) > 1e-12) {
              if (hasOwnProperty(currentUnitSystem, baseDim)) {
                proposedUnitList.push({
                  unit: currentUnitSystem[baseDim].unit,
                  prefix: currentUnitSystem[baseDim].prefix,
                  power: ret.dimensions[i] || 0
                });
              } else {
                missingBaseDim = true;
              }
            }
          }
          if (proposedUnitList.length < ret.units.length && !missingBaseDim) {
            ret.units = proposedUnitList;
          }
        }
      }
      return ret;
    };
    Unit2.prototype.toSI = function() {
      var ret = this.clone();
      var proposedUnitList = [];
      for (var i = 0; i < BASE_DIMENSIONS.length; i++) {
        var baseDim = BASE_DIMENSIONS[i];
        if (Math.abs(ret.dimensions[i] || 0) > 1e-12) {
          if (hasOwnProperty(UNIT_SYSTEMS.si, baseDim)) {
            proposedUnitList.push({
              unit: UNIT_SYSTEMS.si[baseDim].unit,
              prefix: UNIT_SYSTEMS.si[baseDim].prefix,
              power: ret.dimensions[i] || 0
            });
          } else {
            throw new Error("Cannot express custom unit " + baseDim + " in SI units");
          }
        }
      }
      ret.units = proposedUnitList;
      ret.fixPrefix = true;
      ret.skipAutomaticSimplification = true;
      return ret;
    };
    Unit2.prototype.formatUnits = function() {
      var strNum = "";
      var strDen = "";
      var nNum = 0;
      var nDen = 0;
      for (var i = 0; i < this.units.length; i++) {
        if (this.units[i].power > 0) {
          nNum++;
          strNum += " " + this.units[i].prefix.name + this.units[i].unit.name;
          if (Math.abs(this.units[i].power - 1) > 1e-15) {
            strNum += "^" + this.units[i].power;
          }
        } else if (this.units[i].power < 0) {
          nDen++;
        }
      }
      if (nDen > 0) {
        for (var _i4 = 0; _i4 < this.units.length; _i4++) {
          if (this.units[_i4].power < 0) {
            if (nNum > 0) {
              strDen += " " + this.units[_i4].prefix.name + this.units[_i4].unit.name;
              if (Math.abs(this.units[_i4].power + 1) > 1e-15) {
                strDen += "^" + -this.units[_i4].power;
              }
            } else {
              strDen += " " + this.units[_i4].prefix.name + this.units[_i4].unit.name;
              strDen += "^" + this.units[_i4].power;
            }
          }
        }
      }
      strNum = strNum.substr(1);
      strDen = strDen.substr(1);
      if (nNum > 1 && nDen > 0) {
        strNum = "(" + strNum + ")";
      }
      if (nDen > 1 && nNum > 0) {
        strDen = "(" + strDen + ")";
      }
      var str = strNum;
      if (nNum > 0 && nDen > 0) {
        str += " / ";
      }
      str += strDen;
      return str;
    };
    Unit2.prototype.format = function(options) {
      var simp = this.skipAutomaticSimplification || this.value === null ? this.clone() : this.simplify();
      var isImaginary = false;
      if (typeof simp.value !== "undefined" && simp.value !== null && isComplex(simp.value)) {
        isImaginary = Math.abs(simp.value.re) < 1e-14;
      }
      for (var i in simp.units) {
        if (hasOwnProperty(simp.units, i)) {
          if (simp.units[i].unit) {
            if (simp.units[i].unit.name === "VA" && isImaginary) {
              simp.units[i].unit = UNITS.VAR;
            } else if (simp.units[i].unit.name === "VAR" && !isImaginary) {
              simp.units[i].unit = UNITS.VA;
            }
          }
        }
      }
      if (simp.units.length === 1 && !simp.fixPrefix) {
        if (Math.abs(simp.units[0].power - Math.round(simp.units[0].power)) < 1e-14) {
          simp.units[0].prefix = simp._bestPrefix();
        }
      }
      var value = simp._denormalize(simp.value);
      var str = simp.value !== null ? format5(value, options || {}) : "";
      var unitStr = simp.formatUnits();
      if (simp.value && isComplex(simp.value)) {
        str = "(" + str + ")";
      }
      if (unitStr.length > 0 && str.length > 0) {
        str += " ";
      }
      str += unitStr;
      return str;
    };
    Unit2.prototype._bestPrefix = function() {
      if (this.units.length !== 1) {
        throw new Error("Can only compute the best prefix for single units with integer powers, like kg, s^2, N^-1, and so forth!");
      }
      if (Math.abs(this.units[0].power - Math.round(this.units[0].power)) >= 1e-14) {
        throw new Error("Can only compute the best prefix for single units with integer powers, like kg, s^2, N^-1, and so forth!");
      }
      var absValue = this.value !== null ? abs2(this.value) : 0;
      var absUnitValue = abs2(this.units[0].unit.value);
      var bestPrefix = this.units[0].prefix;
      if (absValue === 0) {
        return bestPrefix;
      }
      var power = this.units[0].power;
      var bestDiff = Math.log(absValue / Math.pow(bestPrefix.value * absUnitValue, power)) / Math.LN10 - 1.2;
      if (bestDiff > -2.200001 && bestDiff < 1.800001)
        return bestPrefix;
      bestDiff = Math.abs(bestDiff);
      var prefixes = this.units[0].unit.prefixes;
      for (var p in prefixes) {
        if (hasOwnProperty(prefixes, p)) {
          var prefix = prefixes[p];
          if (prefix.scientific) {
            var diff = Math.abs(Math.log(absValue / Math.pow(prefix.value * absUnitValue, power)) / Math.LN10 - 1.2);
            if (diff < bestDiff || diff === bestDiff && prefix.name.length < bestPrefix.name.length) {
              bestPrefix = prefix;
              bestDiff = diff;
            }
          }
        }
      }
      return bestPrefix;
    };
    Unit2.prototype.splitUnit = function(parts) {
      var x = this.clone();
      var ret = [];
      for (var i = 0; i < parts.length; i++) {
        x = x.to(parts[i]);
        if (i === parts.length - 1)
          break;
        var xNumeric = x.toNumeric();
        var xRounded = round2(xNumeric);
        var xFixed = void 0;
        var isNearlyEqual = equal2(xRounded, xNumeric);
        if (isNearlyEqual) {
          xFixed = xRounded;
        } else {
          xFixed = fix2(x.toNumeric());
        }
        var y = new Unit2(xFixed, parts[i].toString());
        ret.push(y);
        x = subtract2(x, y);
      }
      var testSum = 0;
      for (var _i5 = 0; _i5 < ret.length; _i5++) {
        testSum = addScalar2(testSum, ret[_i5].value);
      }
      if (equal2(testSum, this.value)) {
        x.value = 0;
      }
      ret.push(x);
      return ret;
    };
    var PREFIXES = {
      NONE: {
        "": {
          name: "",
          value: 1,
          scientific: true
        }
      },
      SHORT: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        da: {
          name: "da",
          value: 10,
          scientific: false
        },
        h: {
          name: "h",
          value: 100,
          scientific: false
        },
        k: {
          name: "k",
          value: 1e3,
          scientific: true
        },
        M: {
          name: "M",
          value: 1e6,
          scientific: true
        },
        G: {
          name: "G",
          value: 1e9,
          scientific: true
        },
        T: {
          name: "T",
          value: 1e12,
          scientific: true
        },
        P: {
          name: "P",
          value: 1e15,
          scientific: true
        },
        E: {
          name: "E",
          value: 1e18,
          scientific: true
        },
        Z: {
          name: "Z",
          value: 1e21,
          scientific: true
        },
        Y: {
          name: "Y",
          value: 1e24,
          scientific: true
        },
        d: {
          name: "d",
          value: 0.1,
          scientific: false
        },
        c: {
          name: "c",
          value: 0.01,
          scientific: false
        },
        m: {
          name: "m",
          value: 1e-3,
          scientific: true
        },
        u: {
          name: "u",
          value: 1e-6,
          scientific: true
        },
        n: {
          name: "n",
          value: 1e-9,
          scientific: true
        },
        p: {
          name: "p",
          value: 1e-12,
          scientific: true
        },
        f: {
          name: "f",
          value: 1e-15,
          scientific: true
        },
        a: {
          name: "a",
          value: 1e-18,
          scientific: true
        },
        z: {
          name: "z",
          value: 1e-21,
          scientific: true
        },
        y: {
          name: "y",
          value: 1e-24,
          scientific: true
        }
      },
      LONG: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        deca: {
          name: "deca",
          value: 10,
          scientific: false
        },
        hecto: {
          name: "hecto",
          value: 100,
          scientific: false
        },
        kilo: {
          name: "kilo",
          value: 1e3,
          scientific: true
        },
        mega: {
          name: "mega",
          value: 1e6,
          scientific: true
        },
        giga: {
          name: "giga",
          value: 1e9,
          scientific: true
        },
        tera: {
          name: "tera",
          value: 1e12,
          scientific: true
        },
        peta: {
          name: "peta",
          value: 1e15,
          scientific: true
        },
        exa: {
          name: "exa",
          value: 1e18,
          scientific: true
        },
        zetta: {
          name: "zetta",
          value: 1e21,
          scientific: true
        },
        yotta: {
          name: "yotta",
          value: 1e24,
          scientific: true
        },
        deci: {
          name: "deci",
          value: 0.1,
          scientific: false
        },
        centi: {
          name: "centi",
          value: 0.01,
          scientific: false
        },
        milli: {
          name: "milli",
          value: 1e-3,
          scientific: true
        },
        micro: {
          name: "micro",
          value: 1e-6,
          scientific: true
        },
        nano: {
          name: "nano",
          value: 1e-9,
          scientific: true
        },
        pico: {
          name: "pico",
          value: 1e-12,
          scientific: true
        },
        femto: {
          name: "femto",
          value: 1e-15,
          scientific: true
        },
        atto: {
          name: "atto",
          value: 1e-18,
          scientific: true
        },
        zepto: {
          name: "zepto",
          value: 1e-21,
          scientific: true
        },
        yocto: {
          name: "yocto",
          value: 1e-24,
          scientific: true
        }
      },
      SQUARED: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        da: {
          name: "da",
          value: 100,
          scientific: false
        },
        h: {
          name: "h",
          value: 1e4,
          scientific: false
        },
        k: {
          name: "k",
          value: 1e6,
          scientific: true
        },
        M: {
          name: "M",
          value: 1e12,
          scientific: true
        },
        G: {
          name: "G",
          value: 1e18,
          scientific: true
        },
        T: {
          name: "T",
          value: 1e24,
          scientific: true
        },
        P: {
          name: "P",
          value: 1e30,
          scientific: true
        },
        E: {
          name: "E",
          value: 1e36,
          scientific: true
        },
        Z: {
          name: "Z",
          value: 1e42,
          scientific: true
        },
        Y: {
          name: "Y",
          value: 1e48,
          scientific: true
        },
        d: {
          name: "d",
          value: 0.01,
          scientific: false
        },
        c: {
          name: "c",
          value: 1e-4,
          scientific: false
        },
        m: {
          name: "m",
          value: 1e-6,
          scientific: true
        },
        u: {
          name: "u",
          value: 1e-12,
          scientific: true
        },
        n: {
          name: "n",
          value: 1e-18,
          scientific: true
        },
        p: {
          name: "p",
          value: 1e-24,
          scientific: true
        },
        f: {
          name: "f",
          value: 1e-30,
          scientific: true
        },
        a: {
          name: "a",
          value: 1e-36,
          scientific: true
        },
        z: {
          name: "z",
          value: 1e-42,
          scientific: true
        },
        y: {
          name: "y",
          value: 1e-48,
          scientific: true
        }
      },
      CUBIC: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        da: {
          name: "da",
          value: 1e3,
          scientific: false
        },
        h: {
          name: "h",
          value: 1e6,
          scientific: false
        },
        k: {
          name: "k",
          value: 1e9,
          scientific: true
        },
        M: {
          name: "M",
          value: 1e18,
          scientific: true
        },
        G: {
          name: "G",
          value: 1e27,
          scientific: true
        },
        T: {
          name: "T",
          value: 1e36,
          scientific: true
        },
        P: {
          name: "P",
          value: 1e45,
          scientific: true
        },
        E: {
          name: "E",
          value: 1e54,
          scientific: true
        },
        Z: {
          name: "Z",
          value: 1e63,
          scientific: true
        },
        Y: {
          name: "Y",
          value: 1e72,
          scientific: true
        },
        d: {
          name: "d",
          value: 1e-3,
          scientific: false
        },
        c: {
          name: "c",
          value: 1e-6,
          scientific: false
        },
        m: {
          name: "m",
          value: 1e-9,
          scientific: true
        },
        u: {
          name: "u",
          value: 1e-18,
          scientific: true
        },
        n: {
          name: "n",
          value: 1e-27,
          scientific: true
        },
        p: {
          name: "p",
          value: 1e-36,
          scientific: true
        },
        f: {
          name: "f",
          value: 1e-45,
          scientific: true
        },
        a: {
          name: "a",
          value: 1e-54,
          scientific: true
        },
        z: {
          name: "z",
          value: 1e-63,
          scientific: true
        },
        y: {
          name: "y",
          value: 1e-72,
          scientific: true
        }
      },
      BINARY_SHORT_SI: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        k: {
          name: "k",
          value: 1e3,
          scientific: true
        },
        M: {
          name: "M",
          value: 1e6,
          scientific: true
        },
        G: {
          name: "G",
          value: 1e9,
          scientific: true
        },
        T: {
          name: "T",
          value: 1e12,
          scientific: true
        },
        P: {
          name: "P",
          value: 1e15,
          scientific: true
        },
        E: {
          name: "E",
          value: 1e18,
          scientific: true
        },
        Z: {
          name: "Z",
          value: 1e21,
          scientific: true
        },
        Y: {
          name: "Y",
          value: 1e24,
          scientific: true
        }
      },
      BINARY_SHORT_IEC: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        Ki: {
          name: "Ki",
          value: 1024,
          scientific: true
        },
        Mi: {
          name: "Mi",
          value: Math.pow(1024, 2),
          scientific: true
        },
        Gi: {
          name: "Gi",
          value: Math.pow(1024, 3),
          scientific: true
        },
        Ti: {
          name: "Ti",
          value: Math.pow(1024, 4),
          scientific: true
        },
        Pi: {
          name: "Pi",
          value: Math.pow(1024, 5),
          scientific: true
        },
        Ei: {
          name: "Ei",
          value: Math.pow(1024, 6),
          scientific: true
        },
        Zi: {
          name: "Zi",
          value: Math.pow(1024, 7),
          scientific: true
        },
        Yi: {
          name: "Yi",
          value: Math.pow(1024, 8),
          scientific: true
        }
      },
      BINARY_LONG_SI: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        kilo: {
          name: "kilo",
          value: 1e3,
          scientific: true
        },
        mega: {
          name: "mega",
          value: 1e6,
          scientific: true
        },
        giga: {
          name: "giga",
          value: 1e9,
          scientific: true
        },
        tera: {
          name: "tera",
          value: 1e12,
          scientific: true
        },
        peta: {
          name: "peta",
          value: 1e15,
          scientific: true
        },
        exa: {
          name: "exa",
          value: 1e18,
          scientific: true
        },
        zetta: {
          name: "zetta",
          value: 1e21,
          scientific: true
        },
        yotta: {
          name: "yotta",
          value: 1e24,
          scientific: true
        }
      },
      BINARY_LONG_IEC: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        kibi: {
          name: "kibi",
          value: 1024,
          scientific: true
        },
        mebi: {
          name: "mebi",
          value: Math.pow(1024, 2),
          scientific: true
        },
        gibi: {
          name: "gibi",
          value: Math.pow(1024, 3),
          scientific: true
        },
        tebi: {
          name: "tebi",
          value: Math.pow(1024, 4),
          scientific: true
        },
        pebi: {
          name: "pebi",
          value: Math.pow(1024, 5),
          scientific: true
        },
        exi: {
          name: "exi",
          value: Math.pow(1024, 6),
          scientific: true
        },
        zebi: {
          name: "zebi",
          value: Math.pow(1024, 7),
          scientific: true
        },
        yobi: {
          name: "yobi",
          value: Math.pow(1024, 8),
          scientific: true
        }
      },
      BTU: {
        "": {
          name: "",
          value: 1,
          scientific: true
        },
        MM: {
          name: "MM",
          value: 1e6,
          scientific: true
        }
      }
    };
    PREFIXES.SHORTLONG = _extends2({}, PREFIXES.SHORT, PREFIXES.LONG);
    PREFIXES.BINARY_SHORT = _extends2({}, PREFIXES.BINARY_SHORT_SI, PREFIXES.BINARY_SHORT_IEC);
    PREFIXES.BINARY_LONG = _extends2({}, PREFIXES.BINARY_LONG_SI, PREFIXES.BINARY_LONG_IEC);
    var BASE_DIMENSIONS = ["MASS", "LENGTH", "TIME", "CURRENT", "TEMPERATURE", "LUMINOUS_INTENSITY", "AMOUNT_OF_SUBSTANCE", "ANGLE", "BIT"];
    var BASE_UNITS = {
      NONE: {
        dimensions: [0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      MASS: {
        dimensions: [1, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      LENGTH: {
        dimensions: [0, 1, 0, 0, 0, 0, 0, 0, 0]
      },
      TIME: {
        dimensions: [0, 0, 1, 0, 0, 0, 0, 0, 0]
      },
      CURRENT: {
        dimensions: [0, 0, 0, 1, 0, 0, 0, 0, 0]
      },
      TEMPERATURE: {
        dimensions: [0, 0, 0, 0, 1, 0, 0, 0, 0]
      },
      LUMINOUS_INTENSITY: {
        dimensions: [0, 0, 0, 0, 0, 1, 0, 0, 0]
      },
      AMOUNT_OF_SUBSTANCE: {
        dimensions: [0, 0, 0, 0, 0, 0, 1, 0, 0]
      },
      FORCE: {
        dimensions: [1, 1, -2, 0, 0, 0, 0, 0, 0]
      },
      SURFACE: {
        dimensions: [0, 2, 0, 0, 0, 0, 0, 0, 0]
      },
      VOLUME: {
        dimensions: [0, 3, 0, 0, 0, 0, 0, 0, 0]
      },
      ENERGY: {
        dimensions: [1, 2, -2, 0, 0, 0, 0, 0, 0]
      },
      POWER: {
        dimensions: [1, 2, -3, 0, 0, 0, 0, 0, 0]
      },
      PRESSURE: {
        dimensions: [1, -1, -2, 0, 0, 0, 0, 0, 0]
      },
      ELECTRIC_CHARGE: {
        dimensions: [0, 0, 1, 1, 0, 0, 0, 0, 0]
      },
      ELECTRIC_CAPACITANCE: {
        dimensions: [-1, -2, 4, 2, 0, 0, 0, 0, 0]
      },
      ELECTRIC_POTENTIAL: {
        dimensions: [1, 2, -3, -1, 0, 0, 0, 0, 0]
      },
      ELECTRIC_RESISTANCE: {
        dimensions: [1, 2, -3, -2, 0, 0, 0, 0, 0]
      },
      ELECTRIC_INDUCTANCE: {
        dimensions: [1, 2, -2, -2, 0, 0, 0, 0, 0]
      },
      ELECTRIC_CONDUCTANCE: {
        dimensions: [-1, -2, 3, 2, 0, 0, 0, 0, 0]
      },
      MAGNETIC_FLUX: {
        dimensions: [1, 2, -2, -1, 0, 0, 0, 0, 0]
      },
      MAGNETIC_FLUX_DENSITY: {
        dimensions: [1, 0, -2, -1, 0, 0, 0, 0, 0]
      },
      FREQUENCY: {
        dimensions: [0, 0, -1, 0, 0, 0, 0, 0, 0]
      },
      ANGLE: {
        dimensions: [0, 0, 0, 0, 0, 0, 0, 1, 0]
      },
      BIT: {
        dimensions: [0, 0, 0, 0, 0, 0, 0, 0, 1]
      }
    };
    for (var key in BASE_UNITS) {
      if (hasOwnProperty(BASE_UNITS, key)) {
        BASE_UNITS[key].key = key;
      }
    }
    var BASE_UNIT_NONE = {};
    var UNIT_NONE = {
      name: "",
      base: BASE_UNIT_NONE,
      value: 1,
      offset: 0,
      dimensions: BASE_DIMENSIONS.map((x) => 0)
    };
    var UNITS = {
      meter: {
        name: "meter",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      inch: {
        name: "inch",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.0254,
        offset: 0
      },
      foot: {
        name: "foot",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.3048,
        offset: 0
      },
      yard: {
        name: "yard",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.9144,
        offset: 0
      },
      mile: {
        name: "mile",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 1609.344,
        offset: 0
      },
      link: {
        name: "link",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.201168,
        offset: 0
      },
      rod: {
        name: "rod",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 5.0292,
        offset: 0
      },
      chain: {
        name: "chain",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 20.1168,
        offset: 0
      },
      angstrom: {
        name: "angstrom",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 1e-10,
        offset: 0
      },
      m: {
        name: "m",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      in: {
        name: "in",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.0254,
        offset: 0
      },
      ft: {
        name: "ft",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.3048,
        offset: 0
      },
      yd: {
        name: "yd",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.9144,
        offset: 0
      },
      mi: {
        name: "mi",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 1609.344,
        offset: 0
      },
      li: {
        name: "li",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 0.201168,
        offset: 0
      },
      rd: {
        name: "rd",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 5.02921,
        offset: 0
      },
      ch: {
        name: "ch",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 20.1168,
        offset: 0
      },
      mil: {
        name: "mil",
        base: BASE_UNITS.LENGTH,
        prefixes: PREFIXES.NONE,
        value: 254e-7,
        offset: 0
      },
      m2: {
        name: "m2",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.SQUARED,
        value: 1,
        offset: 0
      },
      sqin: {
        name: "sqin",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 64516e-8,
        offset: 0
      },
      sqft: {
        name: "sqft",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 0.09290304,
        offset: 0
      },
      sqyd: {
        name: "sqyd",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 0.83612736,
        offset: 0
      },
      sqmi: {
        name: "sqmi",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 2589988110336e-6,
        offset: 0
      },
      sqrd: {
        name: "sqrd",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 25.29295,
        offset: 0
      },
      sqch: {
        name: "sqch",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 404.6873,
        offset: 0
      },
      sqmil: {
        name: "sqmil",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 64516e-14,
        offset: 0
      },
      acre: {
        name: "acre",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 4046.86,
        offset: 0
      },
      hectare: {
        name: "hectare",
        base: BASE_UNITS.SURFACE,
        prefixes: PREFIXES.NONE,
        value: 1e4,
        offset: 0
      },
      m3: {
        name: "m3",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.CUBIC,
        value: 1,
        offset: 0
      },
      L: {
        name: "L",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.SHORT,
        value: 1e-3,
        offset: 0
      },
      l: {
        name: "l",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.SHORT,
        value: 1e-3,
        offset: 0
      },
      litre: {
        name: "litre",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.LONG,
        value: 1e-3,
        offset: 0
      },
      cuin: {
        name: "cuin",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 16387064e-12,
        offset: 0
      },
      cuft: {
        name: "cuft",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 0.028316846592,
        offset: 0
      },
      cuyd: {
        name: "cuyd",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 0.764554857984,
        offset: 0
      },
      teaspoon: {
        name: "teaspoon",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 5e-6,
        offset: 0
      },
      tablespoon: {
        name: "tablespoon",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 15e-6,
        offset: 0
      },
      drop: {
        name: "drop",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 5e-8,
        offset: 0
      },
      gtt: {
        name: "gtt",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 5e-8,
        offset: 0
      },
      minim: {
        name: "minim",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 6161152e-14,
        offset: 0
      },
      fluiddram: {
        name: "fluiddram",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 36966911e-13,
        offset: 0
      },
      fluidounce: {
        name: "fluidounce",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 2957353e-11,
        offset: 0
      },
      gill: {
        name: "gill",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 1182941e-10,
        offset: 0
      },
      cc: {
        name: "cc",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 1e-6,
        offset: 0
      },
      cup: {
        name: "cup",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 2365882e-10,
        offset: 0
      },
      pint: {
        name: "pint",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 4731765e-10,
        offset: 0
      },
      quart: {
        name: "quart",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 9463529e-10,
        offset: 0
      },
      gallon: {
        name: "gallon",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 3785412e-9,
        offset: 0
      },
      beerbarrel: {
        name: "beerbarrel",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 0.1173478,
        offset: 0
      },
      oilbarrel: {
        name: "oilbarrel",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 0.1589873,
        offset: 0
      },
      hogshead: {
        name: "hogshead",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 0.238481,
        offset: 0
      },
      fldr: {
        name: "fldr",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 36966911e-13,
        offset: 0
      },
      floz: {
        name: "floz",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 2957353e-11,
        offset: 0
      },
      gi: {
        name: "gi",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 1182941e-10,
        offset: 0
      },
      cp: {
        name: "cp",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 2365882e-10,
        offset: 0
      },
      pt: {
        name: "pt",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 4731765e-10,
        offset: 0
      },
      qt: {
        name: "qt",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 9463529e-10,
        offset: 0
      },
      gal: {
        name: "gal",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 3785412e-9,
        offset: 0
      },
      bbl: {
        name: "bbl",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 0.1173478,
        offset: 0
      },
      obl: {
        name: "obl",
        base: BASE_UNITS.VOLUME,
        prefixes: PREFIXES.NONE,
        value: 0.1589873,
        offset: 0
      },
      g: {
        name: "g",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.SHORT,
        value: 1e-3,
        offset: 0
      },
      gram: {
        name: "gram",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.LONG,
        value: 1e-3,
        offset: 0
      },
      ton: {
        name: "ton",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.SHORT,
        value: 907.18474,
        offset: 0
      },
      t: {
        name: "t",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.SHORT,
        value: 1e3,
        offset: 0
      },
      tonne: {
        name: "tonne",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.LONG,
        value: 1e3,
        offset: 0
      },
      grain: {
        name: "grain",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 6479891e-11,
        offset: 0
      },
      dram: {
        name: "dram",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 0.0017718451953125,
        offset: 0
      },
      ounce: {
        name: "ounce",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 0.028349523125,
        offset: 0
      },
      poundmass: {
        name: "poundmass",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 0.45359237,
        offset: 0
      },
      hundredweight: {
        name: "hundredweight",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 45.359237,
        offset: 0
      },
      stick: {
        name: "stick",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 0.115,
        offset: 0
      },
      stone: {
        name: "stone",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 6.35029318,
        offset: 0
      },
      gr: {
        name: "gr",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 6479891e-11,
        offset: 0
      },
      dr: {
        name: "dr",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 0.0017718451953125,
        offset: 0
      },
      oz: {
        name: "oz",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 0.028349523125,
        offset: 0
      },
      lbm: {
        name: "lbm",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 0.45359237,
        offset: 0
      },
      cwt: {
        name: "cwt",
        base: BASE_UNITS.MASS,
        prefixes: PREFIXES.NONE,
        value: 45.359237,
        offset: 0
      },
      s: {
        name: "s",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      min: {
        name: "min",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 60,
        offset: 0
      },
      h: {
        name: "h",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 3600,
        offset: 0
      },
      second: {
        name: "second",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      sec: {
        name: "sec",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      minute: {
        name: "minute",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 60,
        offset: 0
      },
      hour: {
        name: "hour",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 3600,
        offset: 0
      },
      day: {
        name: "day",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 86400,
        offset: 0
      },
      week: {
        name: "week",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 7 * 86400,
        offset: 0
      },
      month: {
        name: "month",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 2629800,
        offset: 0
      },
      year: {
        name: "year",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 31557600,
        offset: 0
      },
      decade: {
        name: "decade",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 315576e3,
        offset: 0
      },
      century: {
        name: "century",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 315576e4,
        offset: 0
      },
      millennium: {
        name: "millennium",
        base: BASE_UNITS.TIME,
        prefixes: PREFIXES.NONE,
        value: 315576e5,
        offset: 0
      },
      hertz: {
        name: "Hertz",
        base: BASE_UNITS.FREQUENCY,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0,
        reciprocal: true
      },
      Hz: {
        name: "Hz",
        base: BASE_UNITS.FREQUENCY,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0,
        reciprocal: true
      },
      rad: {
        name: "rad",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      radian: {
        name: "radian",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      deg: {
        name: "deg",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.SHORT,
        value: null,
        offset: 0
      },
      degree: {
        name: "degree",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.LONG,
        value: null,
        offset: 0
      },
      grad: {
        name: "grad",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.SHORT,
        value: null,
        offset: 0
      },
      gradian: {
        name: "gradian",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.LONG,
        value: null,
        offset: 0
      },
      cycle: {
        name: "cycle",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.NONE,
        value: null,
        offset: 0
      },
      arcsec: {
        name: "arcsec",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.NONE,
        value: null,
        offset: 0
      },
      arcmin: {
        name: "arcmin",
        base: BASE_UNITS.ANGLE,
        prefixes: PREFIXES.NONE,
        value: null,
        offset: 0
      },
      A: {
        name: "A",
        base: BASE_UNITS.CURRENT,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      ampere: {
        name: "ampere",
        base: BASE_UNITS.CURRENT,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      K: {
        name: "K",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1,
        offset: 0
      },
      degC: {
        name: "degC",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1,
        offset: 273.15
      },
      degF: {
        name: "degF",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1 / 1.8,
        offset: 459.67
      },
      degR: {
        name: "degR",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1 / 1.8,
        offset: 0
      },
      kelvin: {
        name: "kelvin",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1,
        offset: 0
      },
      celsius: {
        name: "celsius",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1,
        offset: 273.15
      },
      fahrenheit: {
        name: "fahrenheit",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1 / 1.8,
        offset: 459.67
      },
      rankine: {
        name: "rankine",
        base: BASE_UNITS.TEMPERATURE,
        prefixes: PREFIXES.NONE,
        value: 1 / 1.8,
        offset: 0
      },
      mol: {
        name: "mol",
        base: BASE_UNITS.AMOUNT_OF_SUBSTANCE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      mole: {
        name: "mole",
        base: BASE_UNITS.AMOUNT_OF_SUBSTANCE,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      cd: {
        name: "cd",
        base: BASE_UNITS.LUMINOUS_INTENSITY,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      candela: {
        name: "candela",
        base: BASE_UNITS.LUMINOUS_INTENSITY,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      N: {
        name: "N",
        base: BASE_UNITS.FORCE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      newton: {
        name: "newton",
        base: BASE_UNITS.FORCE,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      dyn: {
        name: "dyn",
        base: BASE_UNITS.FORCE,
        prefixes: PREFIXES.SHORT,
        value: 1e-5,
        offset: 0
      },
      dyne: {
        name: "dyne",
        base: BASE_UNITS.FORCE,
        prefixes: PREFIXES.LONG,
        value: 1e-5,
        offset: 0
      },
      lbf: {
        name: "lbf",
        base: BASE_UNITS.FORCE,
        prefixes: PREFIXES.NONE,
        value: 4.4482216152605,
        offset: 0
      },
      poundforce: {
        name: "poundforce",
        base: BASE_UNITS.FORCE,
        prefixes: PREFIXES.NONE,
        value: 4.4482216152605,
        offset: 0
      },
      kip: {
        name: "kip",
        base: BASE_UNITS.FORCE,
        prefixes: PREFIXES.LONG,
        value: 4448.2216,
        offset: 0
      },
      J: {
        name: "J",
        base: BASE_UNITS.ENERGY,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      joule: {
        name: "joule",
        base: BASE_UNITS.ENERGY,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      erg: {
        name: "erg",
        base: BASE_UNITS.ENERGY,
        prefixes: PREFIXES.NONE,
        value: 1e-7,
        offset: 0
      },
      Wh: {
        name: "Wh",
        base: BASE_UNITS.ENERGY,
        prefixes: PREFIXES.SHORT,
        value: 3600,
        offset: 0
      },
      BTU: {
        name: "BTU",
        base: BASE_UNITS.ENERGY,
        prefixes: PREFIXES.BTU,
        value: 1055.05585262,
        offset: 0
      },
      eV: {
        name: "eV",
        base: BASE_UNITS.ENERGY,
        prefixes: PREFIXES.SHORT,
        value: 1602176565e-28,
        offset: 0
      },
      electronvolt: {
        name: "electronvolt",
        base: BASE_UNITS.ENERGY,
        prefixes: PREFIXES.LONG,
        value: 1602176565e-28,
        offset: 0
      },
      W: {
        name: "W",
        base: BASE_UNITS.POWER,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      watt: {
        name: "watt",
        base: BASE_UNITS.POWER,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      hp: {
        name: "hp",
        base: BASE_UNITS.POWER,
        prefixes: PREFIXES.NONE,
        value: 745.6998715386,
        offset: 0
      },
      VAR: {
        name: "VAR",
        base: BASE_UNITS.POWER,
        prefixes: PREFIXES.SHORT,
        value: Complex3.I,
        offset: 0
      },
      VA: {
        name: "VA",
        base: BASE_UNITS.POWER,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      Pa: {
        name: "Pa",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      psi: {
        name: "psi",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.NONE,
        value: 6894.75729276459,
        offset: 0
      },
      atm: {
        name: "atm",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.NONE,
        value: 101325,
        offset: 0
      },
      bar: {
        name: "bar",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.SHORTLONG,
        value: 1e5,
        offset: 0
      },
      torr: {
        name: "torr",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.NONE,
        value: 133.322,
        offset: 0
      },
      mmHg: {
        name: "mmHg",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.NONE,
        value: 133.322,
        offset: 0
      },
      mmH2O: {
        name: "mmH2O",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.NONE,
        value: 9.80665,
        offset: 0
      },
      cmH2O: {
        name: "cmH2O",
        base: BASE_UNITS.PRESSURE,
        prefixes: PREFIXES.NONE,
        value: 98.0665,
        offset: 0
      },
      coulomb: {
        name: "coulomb",
        base: BASE_UNITS.ELECTRIC_CHARGE,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      C: {
        name: "C",
        base: BASE_UNITS.ELECTRIC_CHARGE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      farad: {
        name: "farad",
        base: BASE_UNITS.ELECTRIC_CAPACITANCE,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      F: {
        name: "F",
        base: BASE_UNITS.ELECTRIC_CAPACITANCE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      volt: {
        name: "volt",
        base: BASE_UNITS.ELECTRIC_POTENTIAL,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      V: {
        name: "V",
        base: BASE_UNITS.ELECTRIC_POTENTIAL,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      ohm: {
        name: "ohm",
        base: BASE_UNITS.ELECTRIC_RESISTANCE,
        prefixes: PREFIXES.SHORTLONG,
        value: 1,
        offset: 0
      },
      henry: {
        name: "henry",
        base: BASE_UNITS.ELECTRIC_INDUCTANCE,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      H: {
        name: "H",
        base: BASE_UNITS.ELECTRIC_INDUCTANCE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      siemens: {
        name: "siemens",
        base: BASE_UNITS.ELECTRIC_CONDUCTANCE,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      S: {
        name: "S",
        base: BASE_UNITS.ELECTRIC_CONDUCTANCE,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      weber: {
        name: "weber",
        base: BASE_UNITS.MAGNETIC_FLUX,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      Wb: {
        name: "Wb",
        base: BASE_UNITS.MAGNETIC_FLUX,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      tesla: {
        name: "tesla",
        base: BASE_UNITS.MAGNETIC_FLUX_DENSITY,
        prefixes: PREFIXES.LONG,
        value: 1,
        offset: 0
      },
      T: {
        name: "T",
        base: BASE_UNITS.MAGNETIC_FLUX_DENSITY,
        prefixes: PREFIXES.SHORT,
        value: 1,
        offset: 0
      },
      b: {
        name: "b",
        base: BASE_UNITS.BIT,
        prefixes: PREFIXES.BINARY_SHORT,
        value: 1,
        offset: 0
      },
      bits: {
        name: "bits",
        base: BASE_UNITS.BIT,
        prefixes: PREFIXES.BINARY_LONG,
        value: 1,
        offset: 0
      },
      B: {
        name: "B",
        base: BASE_UNITS.BIT,
        prefixes: PREFIXES.BINARY_SHORT,
        value: 8,
        offset: 0
      },
      bytes: {
        name: "bytes",
        base: BASE_UNITS.BIT,
        prefixes: PREFIXES.BINARY_LONG,
        value: 8,
        offset: 0
      }
    };
    var ALIASES = {
      meters: "meter",
      inches: "inch",
      feet: "foot",
      yards: "yard",
      miles: "mile",
      links: "link",
      rods: "rod",
      chains: "chain",
      angstroms: "angstrom",
      lt: "l",
      litres: "litre",
      liter: "litre",
      liters: "litre",
      teaspoons: "teaspoon",
      tablespoons: "tablespoon",
      minims: "minim",
      fluiddrams: "fluiddram",
      fluidounces: "fluidounce",
      gills: "gill",
      cups: "cup",
      pints: "pint",
      quarts: "quart",
      gallons: "gallon",
      beerbarrels: "beerbarrel",
      oilbarrels: "oilbarrel",
      hogsheads: "hogshead",
      gtts: "gtt",
      grams: "gram",
      tons: "ton",
      tonnes: "tonne",
      grains: "grain",
      drams: "dram",
      ounces: "ounce",
      poundmasses: "poundmass",
      hundredweights: "hundredweight",
      sticks: "stick",
      lb: "lbm",
      lbs: "lbm",
      kips: "kip",
      acres: "acre",
      hectares: "hectare",
      sqfeet: "sqft",
      sqyard: "sqyd",
      sqmile: "sqmi",
      sqmiles: "sqmi",
      mmhg: "mmHg",
      mmh2o: "mmH2O",
      cmh2o: "cmH2O",
      seconds: "second",
      secs: "second",
      minutes: "minute",
      mins: "minute",
      hours: "hour",
      hr: "hour",
      hrs: "hour",
      days: "day",
      weeks: "week",
      months: "month",
      years: "year",
      decades: "decade",
      centuries: "century",
      millennia: "millennium",
      hertz: "hertz",
      radians: "radian",
      degrees: "degree",
      gradians: "gradian",
      cycles: "cycle",
      arcsecond: "arcsec",
      arcseconds: "arcsec",
      arcminute: "arcmin",
      arcminutes: "arcmin",
      BTUs: "BTU",
      watts: "watt",
      joules: "joule",
      amperes: "ampere",
      coulombs: "coulomb",
      volts: "volt",
      ohms: "ohm",
      farads: "farad",
      webers: "weber",
      teslas: "tesla",
      electronvolts: "electronvolt",
      moles: "mole",
      bit: "bits",
      byte: "bytes"
    };
    function calculateAngleValues(config6) {
      if (config6.number === "BigNumber") {
        var pi3 = createBigNumberPi(_BigNumber);
        UNITS.rad.value = new _BigNumber(1);
        UNITS.deg.value = pi3.div(180);
        UNITS.grad.value = pi3.div(200);
        UNITS.cycle.value = pi3.times(2);
        UNITS.arcsec.value = pi3.div(648e3);
        UNITS.arcmin.value = pi3.div(10800);
      } else {
        UNITS.rad.value = 1;
        UNITS.deg.value = Math.PI / 180;
        UNITS.grad.value = Math.PI / 200;
        UNITS.cycle.value = Math.PI * 2;
        UNITS.arcsec.value = Math.PI / 648e3;
        UNITS.arcmin.value = Math.PI / 10800;
      }
      UNITS.radian.value = UNITS.rad.value;
      UNITS.degree.value = UNITS.deg.value;
      UNITS.gradian.value = UNITS.grad.value;
    }
    calculateAngleValues(config5);
    if (on) {
      on("config", function(curr, prev) {
        if (curr.number !== prev.number) {
          calculateAngleValues(curr);
        }
      });
    }
    var UNIT_SYSTEMS = {
      si: {
        NONE: {
          unit: UNIT_NONE,
          prefix: PREFIXES.NONE[""]
        },
        LENGTH: {
          unit: UNITS.m,
          prefix: PREFIXES.SHORT[""]
        },
        MASS: {
          unit: UNITS.g,
          prefix: PREFIXES.SHORT.k
        },
        TIME: {
          unit: UNITS.s,
          prefix: PREFIXES.SHORT[""]
        },
        CURRENT: {
          unit: UNITS.A,
          prefix: PREFIXES.SHORT[""]
        },
        TEMPERATURE: {
          unit: UNITS.K,
          prefix: PREFIXES.SHORT[""]
        },
        LUMINOUS_INTENSITY: {
          unit: UNITS.cd,
          prefix: PREFIXES.SHORT[""]
        },
        AMOUNT_OF_SUBSTANCE: {
          unit: UNITS.mol,
          prefix: PREFIXES.SHORT[""]
        },
        ANGLE: {
          unit: UNITS.rad,
          prefix: PREFIXES.SHORT[""]
        },
        BIT: {
          unit: UNITS.bits,
          prefix: PREFIXES.SHORT[""]
        },
        FORCE: {
          unit: UNITS.N,
          prefix: PREFIXES.SHORT[""]
        },
        ENERGY: {
          unit: UNITS.J,
          prefix: PREFIXES.SHORT[""]
        },
        POWER: {
          unit: UNITS.W,
          prefix: PREFIXES.SHORT[""]
        },
        PRESSURE: {
          unit: UNITS.Pa,
          prefix: PREFIXES.SHORT[""]
        },
        ELECTRIC_CHARGE: {
          unit: UNITS.C,
          prefix: PREFIXES.SHORT[""]
        },
        ELECTRIC_CAPACITANCE: {
          unit: UNITS.F,
          prefix: PREFIXES.SHORT[""]
        },
        ELECTRIC_POTENTIAL: {
          unit: UNITS.V,
          prefix: PREFIXES.SHORT[""]
        },
        ELECTRIC_RESISTANCE: {
          unit: UNITS.ohm,
          prefix: PREFIXES.SHORT[""]
        },
        ELECTRIC_INDUCTANCE: {
          unit: UNITS.H,
          prefix: PREFIXES.SHORT[""]
        },
        ELECTRIC_CONDUCTANCE: {
          unit: UNITS.S,
          prefix: PREFIXES.SHORT[""]
        },
        MAGNETIC_FLUX: {
          unit: UNITS.Wb,
          prefix: PREFIXES.SHORT[""]
        },
        MAGNETIC_FLUX_DENSITY: {
          unit: UNITS.T,
          prefix: PREFIXES.SHORT[""]
        },
        FREQUENCY: {
          unit: UNITS.Hz,
          prefix: PREFIXES.SHORT[""]
        }
      }
    };
    UNIT_SYSTEMS.cgs = JSON.parse(JSON.stringify(UNIT_SYSTEMS.si));
    UNIT_SYSTEMS.cgs.LENGTH = {
      unit: UNITS.m,
      prefix: PREFIXES.SHORT.c
    };
    UNIT_SYSTEMS.cgs.MASS = {
      unit: UNITS.g,
      prefix: PREFIXES.SHORT[""]
    };
    UNIT_SYSTEMS.cgs.FORCE = {
      unit: UNITS.dyn,
      prefix: PREFIXES.SHORT[""]
    };
    UNIT_SYSTEMS.cgs.ENERGY = {
      unit: UNITS.erg,
      prefix: PREFIXES.NONE[""]
    };
    UNIT_SYSTEMS.us = JSON.parse(JSON.stringify(UNIT_SYSTEMS.si));
    UNIT_SYSTEMS.us.LENGTH = {
      unit: UNITS.ft,
      prefix: PREFIXES.NONE[""]
    };
    UNIT_SYSTEMS.us.MASS = {
      unit: UNITS.lbm,
      prefix: PREFIXES.NONE[""]
    };
    UNIT_SYSTEMS.us.TEMPERATURE = {
      unit: UNITS.degF,
      prefix: PREFIXES.NONE[""]
    };
    UNIT_SYSTEMS.us.FORCE = {
      unit: UNITS.lbf,
      prefix: PREFIXES.NONE[""]
    };
    UNIT_SYSTEMS.us.ENERGY = {
      unit: UNITS.BTU,
      prefix: PREFIXES.BTU[""]
    };
    UNIT_SYSTEMS.us.POWER = {
      unit: UNITS.hp,
      prefix: PREFIXES.NONE[""]
    };
    UNIT_SYSTEMS.us.PRESSURE = {
      unit: UNITS.psi,
      prefix: PREFIXES.NONE[""]
    };
    UNIT_SYSTEMS.auto = JSON.parse(JSON.stringify(UNIT_SYSTEMS.si));
    var currentUnitSystem = UNIT_SYSTEMS.auto;
    Unit2.setUnitSystem = function(name94) {
      if (hasOwnProperty(UNIT_SYSTEMS, name94)) {
        currentUnitSystem = UNIT_SYSTEMS[name94];
      } else {
        throw new Error("Unit system " + name94 + " does not exist. Choices are: " + Object.keys(UNIT_SYSTEMS).join(", "));
      }
    };
    Unit2.getUnitSystem = function() {
      for (var _key in UNIT_SYSTEMS) {
        if (hasOwnProperty(UNIT_SYSTEMS, _key)) {
          if (UNIT_SYSTEMS[_key] === currentUnitSystem) {
            return _key;
          }
        }
      }
    };
    Unit2.typeConverters = {
      BigNumber: function BigNumber2(x) {
        return new _BigNumber(x + "");
      },
      Fraction: function Fraction3(x) {
        return new _Fraction(x);
      },
      Complex: function Complex4(x) {
        return x;
      },
      number: function number51(x) {
        return x;
      }
    };
    Unit2._getNumberConverter = function(type) {
      if (!Unit2.typeConverters[type]) {
        throw new TypeError('Unsupported type "' + type + '"');
      }
      return Unit2.typeConverters[type];
    };
    for (var _key2 in UNITS) {
      if (hasOwnProperty(UNITS, _key2)) {
        var unit = UNITS[_key2];
        unit.dimensions = unit.base.dimensions;
      }
    }
    for (var _name2 in ALIASES) {
      if (hasOwnProperty(ALIASES, _name2)) {
        var _unit2 = UNITS[ALIASES[_name2]];
        var alias = {};
        for (var _key3 in _unit2) {
          if (hasOwnProperty(_unit2, _key3)) {
            alias[_key3] = _unit2[_key3];
          }
        }
        alias.name = _name2;
        UNITS[_name2] = alias;
      }
    }
    Unit2.isValidAlpha = function isValidAlpha(c2) {
      return /^[a-zA-Z]$/.test(c2);
    };
    function assertUnitNameIsValid(name94) {
      for (var i = 0; i < name94.length; i++) {
        c = name94.charAt(i);
        if (i === 0 && !Unit2.isValidAlpha(c)) {
          throw new Error('Invalid unit name (must begin with alpha character): "' + name94 + '"');
        }
        if (i > 0 && !(Unit2.isValidAlpha(c) || isDigit(c))) {
          throw new Error('Invalid unit name (only alphanumeric characters are allowed): "' + name94 + '"');
        }
      }
    }
    Unit2.createUnit = function(obj, options) {
      if (typeof obj !== "object") {
        throw new TypeError("createUnit expects first parameter to be of type 'Object'");
      }
      if (options && options.override) {
        for (var _key4 in obj) {
          if (hasOwnProperty(obj, _key4)) {
            Unit2.deleteUnit(_key4);
          }
          if (obj[_key4].aliases) {
            for (var i = 0; i < obj[_key4].aliases.length; i++) {
              Unit2.deleteUnit(obj[_key4].aliases[i]);
            }
          }
        }
      }
      var lastUnit;
      for (var _key5 in obj) {
        if (hasOwnProperty(obj, _key5)) {
          lastUnit = Unit2.createUnitSingle(_key5, obj[_key5]);
        }
      }
      return lastUnit;
    };
    Unit2.createUnitSingle = function(name94, obj, options) {
      if (typeof obj === "undefined" || obj === null) {
        obj = {};
      }
      if (typeof name94 !== "string") {
        throw new TypeError("createUnitSingle expects first parameter to be of type 'string'");
      }
      if (hasOwnProperty(UNITS, name94)) {
        throw new Error('Cannot create unit "' + name94 + '": a unit with that name already exists');
      }
      assertUnitNameIsValid(name94);
      var defUnit = null;
      var aliases = [];
      var offset = 0;
      var definition;
      var prefixes;
      var baseName;
      if (obj && obj.type === "Unit") {
        defUnit = obj.clone();
      } else if (typeof obj === "string") {
        if (obj !== "") {
          definition = obj;
        }
      } else if (typeof obj === "object") {
        definition = obj.definition;
        prefixes = obj.prefixes;
        offset = obj.offset;
        baseName = obj.baseName;
        if (obj.aliases) {
          aliases = obj.aliases.valueOf();
        }
      } else {
        throw new TypeError('Cannot create unit "' + name94 + '" from "' + obj.toString() + '": expecting "string" or "Unit" or "Object"');
      }
      if (aliases) {
        for (var i = 0; i < aliases.length; i++) {
          if (hasOwnProperty(UNITS, aliases[i])) {
            throw new Error('Cannot create alias "' + aliases[i] + '": a unit with that name already exists');
          }
        }
      }
      if (definition && typeof definition === "string" && !defUnit) {
        try {
          defUnit = Unit2.parse(definition, {
            allowNoUnits: true
          });
        } catch (ex) {
          ex.message = 'Could not create unit "' + name94 + '" from "' + definition + '": ' + ex.message;
          throw ex;
        }
      } else if (definition && definition.type === "Unit") {
        defUnit = definition.clone();
      }
      aliases = aliases || [];
      offset = offset || 0;
      if (prefixes && prefixes.toUpperCase) {
        prefixes = PREFIXES[prefixes.toUpperCase()] || PREFIXES.NONE;
      } else {
        prefixes = PREFIXES.NONE;
      }
      var newUnit = {};
      if (!defUnit) {
        baseName = baseName || name94 + "_STUFF";
        if (BASE_DIMENSIONS.indexOf(baseName) >= 0) {
          throw new Error('Cannot create new base unit "' + name94 + '": a base unit with that name already exists (and cannot be overridden)');
        }
        BASE_DIMENSIONS.push(baseName);
        for (var b in BASE_UNITS) {
          if (hasOwnProperty(BASE_UNITS, b)) {
            BASE_UNITS[b].dimensions[BASE_DIMENSIONS.length - 1] = 0;
          }
        }
        var newBaseUnit = {
          dimensions: []
        };
        for (var _i6 = 0; _i6 < BASE_DIMENSIONS.length; _i6++) {
          newBaseUnit.dimensions[_i6] = 0;
        }
        newBaseUnit.dimensions[BASE_DIMENSIONS.length - 1] = 1;
        newBaseUnit.key = baseName;
        BASE_UNITS[baseName] = newBaseUnit;
        newUnit = {
          name: name94,
          value: 1,
          dimensions: BASE_UNITS[baseName].dimensions.slice(0),
          prefixes,
          offset,
          base: BASE_UNITS[baseName]
        };
        currentUnitSystem[baseName] = {
          unit: newUnit,
          prefix: PREFIXES.NONE[""]
        };
      } else {
        newUnit = {
          name: name94,
          value: defUnit.value,
          dimensions: defUnit.dimensions.slice(0),
          prefixes,
          offset
        };
        var anyMatch = false;
        for (var _i7 in BASE_UNITS) {
          if (hasOwnProperty(BASE_UNITS, _i7)) {
            var match = true;
            for (var j = 0; j < BASE_DIMENSIONS.length; j++) {
              if (Math.abs((newUnit.dimensions[j] || 0) - (BASE_UNITS[_i7].dimensions[j] || 0)) > 1e-12) {
                match = false;
                break;
              }
            }
            if (match) {
              anyMatch = true;
              newUnit.base = BASE_UNITS[_i7];
              break;
            }
          }
        }
        if (!anyMatch) {
          baseName = baseName || name94 + "_STUFF";
          var _newBaseUnit = {
            dimensions: defUnit.dimensions.slice(0)
          };
          _newBaseUnit.key = baseName;
          BASE_UNITS[baseName] = _newBaseUnit;
          currentUnitSystem[baseName] = {
            unit: newUnit,
            prefix: PREFIXES.NONE[""]
          };
          newUnit.base = BASE_UNITS[baseName];
        }
      }
      Unit2.UNITS[name94] = newUnit;
      for (var _i8 = 0; _i8 < aliases.length; _i8++) {
        var aliasName = aliases[_i8];
        var _alias = {};
        for (var _key6 in newUnit) {
          if (hasOwnProperty(newUnit, _key6)) {
            _alias[_key6] = newUnit[_key6];
          }
        }
        _alias.name = aliasName;
        Unit2.UNITS[aliasName] = _alias;
      }
      return new Unit2(null, name94);
    };
    Unit2.deleteUnit = function(name94) {
      delete Unit2.UNITS[name94];
    };
    Unit2.PREFIXES = PREFIXES;
    Unit2.BASE_DIMENSIONS = BASE_DIMENSIONS;
    Unit2.BASE_UNITS = BASE_UNITS;
    Unit2.UNIT_SYSTEMS = UNIT_SYSTEMS;
    Unit2.UNITS = UNITS;
    return Unit2;
  }, {
    isClass: true
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/acos.js
  var name70 = "acos";
  var dependencies71 = ["typed", "config", "Complex"];
  var createAcos = /* @__PURE__ */ factory(name70, dependencies71, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3
    } = _ref;
    return typed2(name70, {
      number: function number50(x) {
        if (x >= -1 && x <= 1 || config5.predictable) {
          return Math.acos(x);
        } else {
          return new Complex3(x, 0).acos();
        }
      },
      Complex: function Complex4(x) {
        return x.acos();
      },
      BigNumber: function BigNumber2(x) {
        return x.acos();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/acosh.js
  var name71 = "acosh";
  var dependencies72 = ["typed", "config", "Complex"];
  var createAcosh = /* @__PURE__ */ factory(name71, dependencies72, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3
    } = _ref;
    return typed2(name71, {
      number: function number50(x) {
        if (x >= 1 || config5.predictable) {
          return acoshNumber(x);
        }
        if (x <= -1) {
          return new Complex3(Math.log(Math.sqrt(x * x - 1) - x), Math.PI);
        }
        return new Complex3(x, 0).acosh();
      },
      Complex: function Complex4(x) {
        return x.acosh();
      },
      BigNumber: function BigNumber2(x) {
        return x.acosh();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/acoth.js
  var name72 = "acoth";
  var dependencies73 = ["typed", "config", "Complex", "BigNumber"];
  var createAcoth = /* @__PURE__ */ factory(name72, dependencies73, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3,
      BigNumber: _BigNumber
    } = _ref;
    return typed2(name72, {
      number: function number50(x) {
        if (x >= 1 || x <= -1 || config5.predictable) {
          return acothNumber(x);
        }
        return new Complex3(x, 0).acoth();
      },
      Complex: function Complex4(x) {
        return x.acoth();
      },
      BigNumber: function BigNumber2(x) {
        return new _BigNumber(1).div(x).atanh();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/acsc.js
  var name73 = "acsc";
  var dependencies74 = ["typed", "config", "Complex", "BigNumber"];
  var createAcsc = /* @__PURE__ */ factory(name73, dependencies74, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3,
      BigNumber: _BigNumber
    } = _ref;
    return typed2(name73, {
      number: function number50(x) {
        if (x <= -1 || x >= 1 || config5.predictable) {
          return acscNumber(x);
        }
        return new Complex3(x, 0).acsc();
      },
      Complex: function Complex4(x) {
        return x.acsc();
      },
      BigNumber: function BigNumber2(x) {
        return new _BigNumber(1).div(x).asin();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/asec.js
  var name74 = "asec";
  var dependencies75 = ["typed", "config", "Complex", "BigNumber"];
  var createAsec = /* @__PURE__ */ factory(name74, dependencies75, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3,
      BigNumber: _BigNumber
    } = _ref;
    return typed2(name74, {
      number: function number50(x) {
        if (x <= -1 || x >= 1 || config5.predictable) {
          return asecNumber(x);
        }
        return new Complex3(x, 0).asec();
      },
      Complex: function Complex4(x) {
        return x.asec();
      },
      BigNumber: function BigNumber2(x) {
        return new _BigNumber(1).div(x).acos();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/asech.js
  var name75 = "asech";
  var dependencies76 = ["typed", "config", "Complex", "BigNumber"];
  var createAsech = /* @__PURE__ */ factory(name75, dependencies76, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3,
      BigNumber: _BigNumber
    } = _ref;
    return typed2(name75, {
      number: function number50(x) {
        if (x <= 1 && x >= -1 || config5.predictable) {
          var xInv = 1 / x;
          if (xInv > 0 || config5.predictable) {
            return asechNumber(x);
          }
          var ret = Math.sqrt(xInv * xInv - 1);
          return new Complex3(Math.log(ret - xInv), Math.PI);
        }
        return new Complex3(x, 0).asech();
      },
      Complex: function Complex4(x) {
        return x.asech();
      },
      BigNumber: function BigNumber2(x) {
        return new _BigNumber(1).div(x).acosh();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/asin.js
  var name76 = "asin";
  var dependencies77 = ["typed", "config", "Complex"];
  var createAsin = /* @__PURE__ */ factory(name76, dependencies77, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3
    } = _ref;
    return typed2(name76, {
      number: function number50(x) {
        if (x >= -1 && x <= 1 || config5.predictable) {
          return Math.asin(x);
        } else {
          return new Complex3(x, 0).asin();
        }
      },
      Complex: function Complex4(x) {
        return x.asin();
      },
      BigNumber: function BigNumber2(x) {
        return x.asin();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/atan.js
  var name77 = "atan";
  var dependencies78 = ["typed"];
  var createAtan = /* @__PURE__ */ factory(name77, dependencies78, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2("atan", {
      number: function number50(x) {
        return Math.atan(x);
      },
      Complex: function Complex3(x) {
        return x.atan();
      },
      BigNumber: function BigNumber2(x) {
        return x.atan();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/atanh.js
  var name78 = "atanh";
  var dependencies79 = ["typed", "config", "Complex"];
  var createAtanh = /* @__PURE__ */ factory(name78, dependencies79, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      Complex: Complex3
    } = _ref;
    return typed2(name78, {
      number: function number50(x) {
        if (x <= 1 && x >= -1 || config5.predictable) {
          return atanhNumber(x);
        }
        return new Complex3(x, 0).atanh();
      },
      Complex: function Complex4(x) {
        return x.atanh();
      },
      BigNumber: function BigNumber2(x) {
        return x.atanh();
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/cos.js
  var name79 = "cos";
  var dependencies80 = ["typed"];
  var createCos = /* @__PURE__ */ factory(name79, dependencies80, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name79, {
      number: Math.cos,
      Complex: function Complex3(x) {
        return x.cos();
      },
      BigNumber: function BigNumber2(x) {
        return x.cos();
      },
      Unit: function Unit2(x) {
        if (!x.hasBase(x.constructor.BASE_UNITS.ANGLE)) {
          throw new TypeError("Unit in function cos is no angle");
        }
        return this(x.value);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/trigonometry/sin.js
  var name80 = "sin";
  var dependencies81 = ["typed"];
  var createSin = /* @__PURE__ */ factory(name80, dependencies81, (_ref) => {
    var {
      typed: typed2
    } = _ref;
    return typed2(name80, {
      number: Math.sin,
      Complex: function Complex3(x) {
        return x.sin();
      },
      BigNumber: function BigNumber2(x) {
        return x.sin();
      },
      Unit: function Unit2(x) {
        if (!x.hasBase(x.constructor.BASE_UNITS.ANGLE)) {
          throw new TypeError("Unit in function sin is no angle");
        }
        return this(x.value);
      },
      "Array | Matrix": function ArrayMatrix(x) {
        return deepMap(x, this, true);
      }
    });
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/add.js
  var name81 = "add";
  var dependencies82 = ["typed", "matrix", "addScalar", "equalScalar", "DenseMatrix", "SparseMatrix"];
  var createAdd = /* @__PURE__ */ factory(name81, dependencies82, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      addScalar: addScalar2,
      equalScalar: equalScalar2,
      DenseMatrix: DenseMatrix2,
      SparseMatrix: SparseMatrix2
    } = _ref;
    var algorithm013 = createAlgorithm01({
      typed: typed2
    });
    var algorithm042 = createAlgorithm04({
      typed: typed2,
      equalScalar: equalScalar2
    });
    var algorithm103 = createAlgorithm10({
      typed: typed2,
      DenseMatrix: DenseMatrix2
    });
    var algorithm1310 = createAlgorithm13({
      typed: typed2
    });
    var algorithm1415 = createAlgorithm14({
      typed: typed2
    });
    return typed2(name81, extend({
      "DenseMatrix, DenseMatrix": function DenseMatrixDenseMatrix(x, y) {
        return algorithm1310(x, y, addScalar2);
      },
      "DenseMatrix, SparseMatrix": function DenseMatrixSparseMatrix(x, y) {
        return algorithm013(x, y, addScalar2, false);
      },
      "SparseMatrix, DenseMatrix": function SparseMatrixDenseMatrix(x, y) {
        return algorithm013(y, x, addScalar2, true);
      },
      "SparseMatrix, SparseMatrix": function SparseMatrixSparseMatrix(x, y) {
        return algorithm042(x, y, addScalar2);
      },
      "Array, Array": function ArrayArray(x, y) {
        return this(matrix2(x), matrix2(y)).valueOf();
      },
      "Array, Matrix": function ArrayMatrix(x, y) {
        return this(matrix2(x), y);
      },
      "Matrix, Array": function MatrixArray(x, y) {
        return this(x, matrix2(y));
      },
      "DenseMatrix, any": function DenseMatrixAny(x, y) {
        return algorithm1415(x, y, addScalar2, false);
      },
      "SparseMatrix, any": function SparseMatrixAny(x, y) {
        return algorithm103(x, y, addScalar2, false);
      },
      "any, DenseMatrix": function anyDenseMatrix(x, y) {
        return algorithm1415(y, x, addScalar2, true);
      },
      "any, SparseMatrix": function anySparseMatrix(x, y) {
        return algorithm103(y, x, addScalar2, true);
      },
      "Array, any": function ArrayAny(x, y) {
        return algorithm1415(matrix2(x), y, addScalar2, false).valueOf();
      },
      "any, Array": function anyArray(x, y) {
        return algorithm1415(matrix2(y), x, addScalar2, true).valueOf();
      },
      "any, any": addScalar2,
      "any, any, ...any": function anyAnyAny(x, y, rest) {
        var result = this(x, y);
        for (var i = 0; i < rest.length; i++) {
          result = this(result, rest[i]);
        }
        return result;
      }
    }, addScalar2.signatures));
  });

  // node_modules/mathjs/lib/esm/function/arithmetic/norm.js
  var name82 = "norm";
  var dependencies83 = ["typed", "abs", "add", "pow", "conj", "sqrt", "multiply", "equalScalar", "larger", "smaller", "matrix", "ctranspose", "eigs"];
  var createNorm = /* @__PURE__ */ factory(name82, dependencies83, (_ref) => {
    var {
      typed: typed2,
      abs: abs2,
      add: add2,
      pow: pow2,
      conj: conj2,
      sqrt: sqrt2,
      multiply: multiply2,
      equalScalar: equalScalar2,
      larger: larger2,
      smaller: smaller2,
      matrix: matrix2,
      ctranspose: ctranspose2,
      eigs: eigs2
    } = _ref;
    return typed2(name82, {
      number: Math.abs,
      Complex: function Complex3(x) {
        return x.abs();
      },
      BigNumber: function BigNumber2(x) {
        return x.abs();
      },
      boolean: function boolean(x) {
        return Math.abs(x);
      },
      Array: function Array2(x) {
        return _norm(matrix2(x), 2);
      },
      Matrix: function Matrix2(x) {
        return _norm(x, 2);
      },
      "number | Complex | BigNumber | boolean, number | BigNumber | string": function numberComplexBigNumberBooleanNumberBigNumberString(x) {
        return this(x);
      },
      "Array, number | BigNumber | string": function ArrayNumberBigNumberString(x, p) {
        return _norm(matrix2(x), p);
      },
      "Matrix, number | BigNumber | string": function MatrixNumberBigNumberString(x, p) {
        return _norm(x, p);
      }
    });
    function _vectorNormPlusInfinity(x) {
      var pinf = 0;
      x.forEach(function(value) {
        var v = abs2(value);
        if (larger2(v, pinf)) {
          pinf = v;
        }
      }, true);
      return pinf;
    }
    function _vectorNormMinusInfinity(x) {
      var ninf;
      x.forEach(function(value) {
        var v = abs2(value);
        if (!ninf || smaller2(v, ninf)) {
          ninf = v;
        }
      }, true);
      return ninf || 0;
    }
    function _vectorNorm(x, p) {
      if (p === Number.POSITIVE_INFINITY || p === "inf") {
        return _vectorNormPlusInfinity(x);
      }
      if (p === Number.NEGATIVE_INFINITY || p === "-inf") {
        return _vectorNormMinusInfinity(x);
      }
      if (p === "fro") {
        return _norm(x, 2);
      }
      if (typeof p === "number" && !isNaN(p)) {
        if (!equalScalar2(p, 0)) {
          var n = 0;
          x.forEach(function(value) {
            n = add2(pow2(abs2(value), p), n);
          }, true);
          return pow2(n, 1 / p);
        }
        return Number.POSITIVE_INFINITY;
      }
      throw new Error("Unsupported parameter value");
    }
    function _matrixNormFrobenius(x) {
      var fro = 0;
      x.forEach(function(value, index) {
        fro = add2(fro, multiply2(value, conj2(value)));
      });
      return abs2(sqrt2(fro));
    }
    function _matrixNormOne(x) {
      var c = [];
      var maxc = 0;
      x.forEach(function(value, index) {
        var j = index[1];
        var cj = add2(c[j] || 0, abs2(value));
        if (larger2(cj, maxc)) {
          maxc = cj;
        }
        c[j] = cj;
      }, true);
      return maxc;
    }
    function _matrixNormTwo(x) {
      var sizeX = x.size();
      if (sizeX[0] !== sizeX[1]) {
        throw new RangeError("Invalid matrix dimensions");
      }
      var tx = ctranspose2(x);
      var squaredX = multiply2(tx, x);
      var eigenVals = eigs2(squaredX).values;
      var rho = eigenVals.get([eigenVals.size()[0] - 1]);
      return abs2(sqrt2(rho));
    }
    function _matrixNormInfinity(x) {
      var r = [];
      var maxr = 0;
      x.forEach(function(value, index) {
        var i = index[0];
        var ri = add2(r[i] || 0, abs2(value));
        if (larger2(ri, maxr)) {
          maxr = ri;
        }
        r[i] = ri;
      }, true);
      return maxr;
    }
    function _matrixNorm(x, p) {
      if (p === 1) {
        return _matrixNormOne(x);
      }
      if (p === Number.POSITIVE_INFINITY || p === "inf") {
        return _matrixNormInfinity(x);
      }
      if (p === "fro") {
        return _matrixNormFrobenius(x);
      }
      if (p === 2) {
        return _matrixNormTwo(x);
      }
      throw new Error("Unsupported parameter value " + p);
    }
    function _norm(x, p) {
      var sizeX = x.size();
      if (sizeX.length === 1) {
        return _vectorNorm(x, p);
      }
      if (sizeX.length === 2) {
        if (sizeX[0] && sizeX[1]) {
          return _matrixNorm(x, p);
        } else {
          throw new RangeError("Invalid matrix dimensions");
        }
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/dot.js
  var name83 = "dot";
  var dependencies84 = ["typed", "addScalar", "multiplyScalar", "conj", "size"];
  var createDot = /* @__PURE__ */ factory(name83, dependencies84, (_ref) => {
    var {
      typed: typed2,
      addScalar: addScalar2,
      multiplyScalar: multiplyScalar2,
      conj: conj2,
      size: size2
    } = _ref;
    return typed2(name83, {
      "Array | DenseMatrix, Array | DenseMatrix": _denseDot,
      "SparseMatrix, SparseMatrix": _sparseDot
    });
    function _validateDim(x, y) {
      var xSize = _size(x);
      var ySize = _size(y);
      var xLen, yLen;
      if (xSize.length === 1) {
        xLen = xSize[0];
      } else if (xSize.length === 2 && xSize[1] === 1) {
        xLen = xSize[0];
      } else {
        throw new RangeError("Expected a column vector, instead got a matrix of size (" + xSize.join(", ") + ")");
      }
      if (ySize.length === 1) {
        yLen = ySize[0];
      } else if (ySize.length === 2 && ySize[1] === 1) {
        yLen = ySize[0];
      } else {
        throw new RangeError("Expected a column vector, instead got a matrix of size (" + ySize.join(", ") + ")");
      }
      if (xLen !== yLen)
        throw new RangeError("Vectors must have equal length (" + xLen + " != " + yLen + ")");
      if (xLen === 0)
        throw new RangeError("Cannot calculate the dot product of empty vectors");
      return xLen;
    }
    function _denseDot(a, b) {
      var N = _validateDim(a, b);
      var adata = isMatrix(a) ? a._data : a;
      var adt = isMatrix(a) ? a._datatype : void 0;
      var bdata = isMatrix(b) ? b._data : b;
      var bdt = isMatrix(b) ? b._datatype : void 0;
      var aIsColumn = _size(a).length === 2;
      var bIsColumn = _size(b).length === 2;
      var add2 = addScalar2;
      var mul = multiplyScalar2;
      if (adt && bdt && adt === bdt && typeof adt === "string") {
        var dt = adt;
        add2 = typed2.find(addScalar2, [dt, dt]);
        mul = typed2.find(multiplyScalar2, [dt, dt]);
      }
      if (!aIsColumn && !bIsColumn) {
        var c = mul(conj2(adata[0]), bdata[0]);
        for (var i = 1; i < N; i++) {
          c = add2(c, mul(conj2(adata[i]), bdata[i]));
        }
        return c;
      }
      if (!aIsColumn && bIsColumn) {
        var _c = mul(conj2(adata[0]), bdata[0][0]);
        for (var _i = 1; _i < N; _i++) {
          _c = add2(_c, mul(conj2(adata[_i]), bdata[_i][0]));
        }
        return _c;
      }
      if (aIsColumn && !bIsColumn) {
        var _c2 = mul(conj2(adata[0][0]), bdata[0]);
        for (var _i2 = 1; _i2 < N; _i2++) {
          _c2 = add2(_c2, mul(conj2(adata[_i2][0]), bdata[_i2]));
        }
        return _c2;
      }
      if (aIsColumn && bIsColumn) {
        var _c3 = mul(conj2(adata[0][0]), bdata[0][0]);
        for (var _i3 = 1; _i3 < N; _i3++) {
          _c3 = add2(_c3, mul(conj2(adata[_i3][0]), bdata[_i3][0]));
        }
        return _c3;
      }
    }
    function _sparseDot(x, y) {
      _validateDim(x, y);
      var xindex = x._index;
      var xvalues = x._values;
      var yindex = y._index;
      var yvalues = y._values;
      var c = 0;
      var add2 = addScalar2;
      var mul = multiplyScalar2;
      var i = 0;
      var j = 0;
      while (i < xindex.length && j < yindex.length) {
        var I = xindex[i];
        var J = yindex[j];
        if (I < J) {
          i++;
          continue;
        }
        if (I > J) {
          j++;
          continue;
        }
        if (I === J) {
          c = add2(c, mul(xvalues[i], yvalues[j]));
          i++;
          j++;
        }
      }
      return c;
    }
    function _size(x) {
      return isMatrix(x) ? x.size() : size2(x);
    }
  });

  // node_modules/mathjs/lib/esm/function/algebra/decomposition/lup.js
  var name84 = "lup";
  var dependencies85 = ["typed", "matrix", "abs", "addScalar", "divideScalar", "multiplyScalar", "subtract", "larger", "equalScalar", "unaryMinus", "DenseMatrix", "SparseMatrix", "Spa"];
  var createLup = /* @__PURE__ */ factory(name84, dependencies85, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      abs: abs2,
      addScalar: addScalar2,
      divideScalar: divideScalar2,
      multiplyScalar: multiplyScalar2,
      subtract: subtract2,
      larger: larger2,
      equalScalar: equalScalar2,
      unaryMinus: unaryMinus2,
      DenseMatrix: DenseMatrix2,
      SparseMatrix: SparseMatrix2,
      Spa: Spa2
    } = _ref;
    return typed2(name84, {
      DenseMatrix: function DenseMatrix3(m) {
        return _denseLUP(m);
      },
      SparseMatrix: function SparseMatrix3(m) {
        return _sparseLUP(m);
      },
      Array: function Array2(a) {
        var m = matrix2(a);
        var r = _denseLUP(m);
        return {
          L: r.L.valueOf(),
          U: r.U.valueOf(),
          p: r.p
        };
      }
    });
    function _denseLUP(m) {
      var rows = m._size[0];
      var columns = m._size[1];
      var n = Math.min(rows, columns);
      var data = clone(m._data);
      var ldata = [];
      var lsize = [rows, n];
      var udata = [];
      var usize = [n, columns];
      var i, j, k;
      var p = [];
      for (i = 0; i < rows; i++) {
        p[i] = i;
      }
      for (j = 0; j < columns; j++) {
        if (j > 0) {
          for (i = 0; i < rows; i++) {
            var min2 = Math.min(i, j);
            var s = 0;
            for (k = 0; k < min2; k++) {
              s = addScalar2(s, multiplyScalar2(data[i][k], data[k][j]));
            }
            data[i][j] = subtract2(data[i][j], s);
          }
        }
        var pi3 = j;
        var pabsv = 0;
        var vjj = 0;
        for (i = j; i < rows; i++) {
          var v = data[i][j];
          var absv = abs2(v);
          if (larger2(absv, pabsv)) {
            pi3 = i;
            pabsv = absv;
            vjj = v;
          }
        }
        if (j !== pi3) {
          p[j] = [p[pi3], p[pi3] = p[j]][0];
          DenseMatrix2._swapRows(j, pi3, data);
        }
        if (j < rows) {
          for (i = j + 1; i < rows; i++) {
            var vij = data[i][j];
            if (!equalScalar2(vij, 0)) {
              data[i][j] = divideScalar2(data[i][j], vjj);
            }
          }
        }
      }
      for (j = 0; j < columns; j++) {
        for (i = 0; i < rows; i++) {
          if (j === 0) {
            if (i < columns) {
              udata[i] = [];
            }
            ldata[i] = [];
          }
          if (i < j) {
            if (i < columns) {
              udata[i][j] = data[i][j];
            }
            if (j < rows) {
              ldata[i][j] = 0;
            }
            continue;
          }
          if (i === j) {
            if (i < columns) {
              udata[i][j] = data[i][j];
            }
            if (j < rows) {
              ldata[i][j] = 1;
            }
            continue;
          }
          if (i < columns) {
            udata[i][j] = 0;
          }
          if (j < rows) {
            ldata[i][j] = data[i][j];
          }
        }
      }
      var l = new DenseMatrix2({
        data: ldata,
        size: lsize
      });
      var u = new DenseMatrix2({
        data: udata,
        size: usize
      });
      var pv = [];
      for (i = 0, n = p.length; i < n; i++) {
        pv[p[i]] = i;
      }
      return {
        L: l,
        U: u,
        p: pv,
        toString: function toString() {
          return "L: " + this.L.toString() + "\nU: " + this.U.toString() + "\nP: " + this.p;
        }
      };
    }
    function _sparseLUP(m) {
      var rows = m._size[0];
      var columns = m._size[1];
      var n = Math.min(rows, columns);
      var values = m._values;
      var index = m._index;
      var ptr = m._ptr;
      var lvalues = [];
      var lindex = [];
      var lptr = [];
      var lsize = [rows, n];
      var uvalues = [];
      var uindex = [];
      var uptr = [];
      var usize = [n, columns];
      var i, j, k;
      var pvCo = [];
      var pvOc = [];
      for (i = 0; i < rows; i++) {
        pvCo[i] = i;
        pvOc[i] = i;
      }
      var swapIndeces = function swapIndeces2(x, y) {
        var kx = pvOc[x];
        var ky = pvOc[y];
        pvCo[kx] = y;
        pvCo[ky] = x;
        pvOc[x] = ky;
        pvOc[y] = kx;
      };
      var _loop = function _loop2() {
        var spa = new Spa2();
        if (j < rows) {
          lptr.push(lvalues.length);
          lvalues.push(1);
          lindex.push(j);
        }
        uptr.push(uvalues.length);
        var k0 = ptr[j];
        var k1 = ptr[j + 1];
        for (k = k0; k < k1; k++) {
          i = index[k];
          spa.set(pvCo[i], values[k]);
        }
        if (j > 0) {
          spa.forEach(0, j - 1, function(k2, vkj) {
            SparseMatrix2._forEachRow(k2, lvalues, lindex, lptr, function(i2, vik) {
              if (i2 > k2) {
                spa.accumulate(i2, unaryMinus2(multiplyScalar2(vik, vkj)));
              }
            });
          });
        }
        var pi3 = j;
        var vjj = spa.get(j);
        var pabsv = abs2(vjj);
        spa.forEach(j + 1, rows - 1, function(x, v) {
          var absv = abs2(v);
          if (larger2(absv, pabsv)) {
            pi3 = x;
            pabsv = absv;
            vjj = v;
          }
        });
        if (j !== pi3) {
          SparseMatrix2._swapRows(j, pi3, lsize[1], lvalues, lindex, lptr);
          SparseMatrix2._swapRows(j, pi3, usize[1], uvalues, uindex, uptr);
          spa.swap(j, pi3);
          swapIndeces(j, pi3);
        }
        spa.forEach(0, rows - 1, function(x, v) {
          if (x <= j) {
            uvalues.push(v);
            uindex.push(x);
          } else {
            v = divideScalar2(v, vjj);
            if (!equalScalar2(v, 0)) {
              lvalues.push(v);
              lindex.push(x);
            }
          }
        });
      };
      for (j = 0; j < columns; j++) {
        _loop();
      }
      uptr.push(uvalues.length);
      lptr.push(lvalues.length);
      return {
        L: new SparseMatrix2({
          values: lvalues,
          index: lindex,
          ptr: lptr,
          size: lsize
        }),
        U: new SparseMatrix2({
          values: uvalues,
          index: uindex,
          ptr: uptr,
          size: usize
        }),
        p: pvCo,
        toString: function toString() {
          return "L: " + this.L.toString() + "\nU: " + this.U.toString() + "\nP: " + this.p;
        }
      };
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/det.js
  var name85 = "det";
  var dependencies86 = ["typed", "matrix", "subtract", "multiply", "unaryMinus", "lup"];
  var createDet = /* @__PURE__ */ factory(name85, dependencies86, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      subtract: subtract2,
      multiply: multiply2,
      unaryMinus: unaryMinus2,
      lup: lup2
    } = _ref;
    return typed2(name85, {
      any: function any(x) {
        return clone(x);
      },
      "Array | Matrix": function det2(x) {
        var size2;
        if (isMatrix(x)) {
          size2 = x.size();
        } else if (Array.isArray(x)) {
          x = matrix2(x);
          size2 = x.size();
        } else {
          size2 = [];
        }
        switch (size2.length) {
          case 0:
            return clone(x);
          case 1:
            if (size2[0] === 1) {
              return clone(x.valueOf()[0]);
            } else {
              throw new RangeError("Matrix must be square (size: " + format3(size2) + ")");
            }
          case 2: {
            var rows = size2[0];
            var cols = size2[1];
            if (rows === cols) {
              return _det(x.clone().valueOf(), rows, cols);
            } else {
              throw new RangeError("Matrix must be square (size: " + format3(size2) + ")");
            }
          }
          default:
            throw new RangeError("Matrix must be two dimensional (size: " + format3(size2) + ")");
        }
      }
    });
    function _det(matrix3, rows, cols) {
      if (rows === 1) {
        return clone(matrix3[0][0]);
      } else if (rows === 2) {
        return subtract2(multiply2(matrix3[0][0], matrix3[1][1]), multiply2(matrix3[1][0], matrix3[0][1]));
      } else {
        var decomp = lup2(matrix3);
        var det2 = decomp.U[0][0];
        for (var _i = 1; _i < rows; _i++) {
          det2 = multiply2(det2, decomp.U[_i][_i]);
        }
        var evenCycles = 0;
        var i = 0;
        var visited = [];
        while (true) {
          while (visited[i]) {
            i++;
          }
          if (i >= rows)
            break;
          var j = i;
          var cycleLen = 0;
          while (!visited[decomp.p[j]]) {
            visited[decomp.p[j]] = true;
            j = decomp.p[j];
            cycleLen++;
          }
          if (cycleLen % 2 === 0) {
            evenCycles++;
          }
        }
        return evenCycles % 2 === 0 ? det2 : unaryMinus2(det2);
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/inv.js
  var name86 = "inv";
  var dependencies87 = ["typed", "matrix", "divideScalar", "addScalar", "multiply", "unaryMinus", "det", "identity", "abs"];
  var createInv = /* @__PURE__ */ factory(name86, dependencies87, (_ref) => {
    var {
      typed: typed2,
      matrix: matrix2,
      divideScalar: divideScalar2,
      addScalar: addScalar2,
      multiply: multiply2,
      unaryMinus: unaryMinus2,
      det: det2,
      identity: identity2,
      abs: abs2
    } = _ref;
    return typed2(name86, {
      "Array | Matrix": function ArrayMatrix(x) {
        var size2 = isMatrix(x) ? x.size() : arraySize(x);
        switch (size2.length) {
          case 1:
            if (size2[0] === 1) {
              if (isMatrix(x)) {
                return matrix2([divideScalar2(1, x.valueOf()[0])]);
              } else {
                return [divideScalar2(1, x[0])];
              }
            } else {
              throw new RangeError("Matrix must be square (size: " + format3(size2) + ")");
            }
          case 2: {
            var rows = size2[0];
            var cols = size2[1];
            if (rows === cols) {
              if (isMatrix(x)) {
                return matrix2(_inv(x.valueOf(), rows, cols), x.storage());
              } else {
                return _inv(x, rows, cols);
              }
            } else {
              throw new RangeError("Matrix must be square (size: " + format3(size2) + ")");
            }
          }
          default:
            throw new RangeError("Matrix must be two dimensional (size: " + format3(size2) + ")");
        }
      },
      any: function any(x) {
        return divideScalar2(1, x);
      }
    });
    function _inv(mat, rows, cols) {
      var r, s, f, value, temp;
      if (rows === 1) {
        value = mat[0][0];
        if (value === 0) {
          throw Error("Cannot calculate inverse, determinant is zero");
        }
        return [[divideScalar2(1, value)]];
      } else if (rows === 2) {
        var d = det2(mat);
        if (d === 0) {
          throw Error("Cannot calculate inverse, determinant is zero");
        }
        return [[divideScalar2(mat[1][1], d), divideScalar2(unaryMinus2(mat[0][1]), d)], [divideScalar2(unaryMinus2(mat[1][0]), d), divideScalar2(mat[0][0], d)]];
      } else {
        var A = mat.concat();
        for (r = 0; r < rows; r++) {
          A[r] = A[r].concat();
        }
        var B = identity2(rows).valueOf();
        for (var c = 0; c < cols; c++) {
          var ABig = abs2(A[c][c]);
          var rBig = c;
          r = c + 1;
          while (r < rows) {
            if (abs2(A[r][c]) > ABig) {
              ABig = abs2(A[r][c]);
              rBig = r;
            }
            r++;
          }
          if (ABig === 0) {
            throw Error("Cannot calculate inverse, determinant is zero");
          }
          r = rBig;
          if (r !== c) {
            temp = A[c];
            A[c] = A[r];
            A[r] = temp;
            temp = B[c];
            B[c] = B[r];
            B[r] = temp;
          }
          var Ac = A[c];
          var Bc = B[c];
          for (r = 0; r < rows; r++) {
            var Ar = A[r];
            var Br = B[r];
            if (r !== c) {
              if (Ar[c] !== 0) {
                f = divideScalar2(unaryMinus2(Ar[c]), Ac[c]);
                for (s = c; s < cols; s++) {
                  Ar[s] = addScalar2(Ar[s], multiply2(f, Ac[s]));
                }
                for (s = 0; s < cols; s++) {
                  Br[s] = addScalar2(Br[s], multiply2(f, Bc[s]));
                }
              }
            } else {
              f = Ac[c];
              for (s = c; s < cols; s++) {
                Ar[s] = divideScalar2(Ar[s], f);
              }
              for (s = 0; s < cols; s++) {
                Br[s] = divideScalar2(Br[s], f);
              }
            }
          }
        }
        return B;
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/matrix/eigs.js
  var name87 = "eigs";
  var dependencies88 = ["config", "typed", "matrix", "addScalar", "equal", "subtract", "abs", "atan", "cos", "sin", "multiplyScalar", "inv", "bignumber", "multiply", "add"];
  var createEigs = /* @__PURE__ */ factory(name87, dependencies88, (_ref) => {
    var {
      config: config5,
      typed: typed2,
      matrix: matrix2,
      addScalar: addScalar2,
      subtract: subtract2,
      equal: equal2,
      abs: abs2,
      atan: atan2,
      cos: cos2,
      sin: sin2,
      multiplyScalar: multiplyScalar2,
      inv: inv2,
      bignumber: bignumber2,
      multiply: multiply2,
      add: add2
    } = _ref;
    return typed2("eigs", {
      Array: function Array2(x) {
        var mat = matrix2(x);
        var size2 = mat.size();
        if (size2.length !== 2 || size2[0] !== size2[1]) {
          throw new RangeError("Matrix must be square (size: " + format3(size2) + ")");
        }
        var ans = checkAndSubmit(mat, size2[0]);
        return {
          values: ans[0],
          vectors: ans[1]
        };
      },
      Matrix: function Matrix2(x) {
        var size2 = x.size();
        if (size2.length !== 2 || size2[0] !== size2[1]) {
          throw new RangeError("Matrix must be square (size: " + format3(size2) + ")");
        }
        var ans = checkAndSubmit(x, size2[0]);
        return {
          values: matrix2(ans[0]),
          vectors: matrix2(ans[1])
        };
      }
    });
    function isSymmetric(x, n) {
      for (var i = 0; i < n; i++) {
        for (var j = i; j < n; j++) {
          if (!equal2(x[i][j], x[j][i])) {
            throw new TypeError("Input matrix is not symmetric");
          }
        }
      }
    }
    function checkAndSubmit(x, n) {
      var type = x.datatype();
      if (type === void 0) {
        type = x.getDataType();
      }
      if (type !== "number" && type !== "BigNumber" && type !== "Fraction") {
        if (type === "mixed") {
          throw new TypeError("Mixed matrix element type is not supported");
        } else {
          throw new TypeError("Matrix element type not supported (" + type + ")");
        }
      } else {
        isSymmetric(x.toArray(), n);
      }
      if (type === "number") {
        return diag(x.toArray());
      } else if (type === "Fraction") {
        var xArr = x.toArray();
        for (var i = 0; i < n; i++) {
          for (var j = i; j < n; j++) {
            xArr[i][j] = xArr[i][j].valueOf();
            xArr[j][i] = xArr[i][j];
          }
        }
        return diag(x.toArray());
      } else if (type === "BigNumber") {
        return diagBig(x.toArray());
      }
    }
    function diag(x) {
      var N = x.length;
      var e0 = Math.abs(config5.epsilon / N);
      var psi;
      var Sij = new Array(N);
      for (var i = 0; i < N; i++) {
        Sij[i] = createArray(N, 0);
        Sij[i][i] = 1;
      }
      var Vab = getAij(x);
      while (Math.abs(Vab[1]) >= Math.abs(e0)) {
        var _i = Vab[0][0];
        var j = Vab[0][1];
        psi = getTheta(x[_i][_i], x[j][j], x[_i][j]);
        x = x1(x, psi, _i, j);
        Sij = Sij1(Sij, psi, _i, j);
        Vab = getAij(x);
      }
      var Ei = createArray(N, 0);
      for (var _i2 = 0; _i2 < N; _i2++) {
        Ei[_i2] = x[_i2][_i2];
      }
      return sorting(clone(Ei), clone(Sij));
    }
    function diagBig(x) {
      var N = x.length;
      var e0 = abs2(config5.epsilon / N);
      var psi;
      var Sij = new Array(N);
      for (var i = 0; i < N; i++) {
        Sij[i] = createArray(N, 0);
        Sij[i][i] = 1;
      }
      var Vab = getAijBig(x);
      while (abs2(Vab[1]) >= abs2(e0)) {
        var _i3 = Vab[0][0];
        var j = Vab[0][1];
        psi = getThetaBig(x[_i3][_i3], x[j][j], x[_i3][j]);
        x = x1Big(x, psi, _i3, j);
        Sij = Sij1Big(Sij, psi, _i3, j);
        Vab = getAijBig(x);
      }
      var Ei = createArray(N, 0);
      for (var _i4 = 0; _i4 < N; _i4++) {
        Ei[_i4] = x[_i4][_i4];
      }
      return sorting(clone(Ei), clone(Sij));
    }
    function getTheta(aii, ajj, aij) {
      var denom = ajj - aii;
      if (Math.abs(denom) <= config5.epsilon) {
        return Math.PI / 4;
      } else {
        return 0.5 * Math.atan(2 * aij / (ajj - aii));
      }
    }
    function getThetaBig(aii, ajj, aij) {
      var denom = subtract2(ajj, aii);
      if (abs2(denom) <= config5.epsilon) {
        return bignumber2(-1).acos().div(4);
      } else {
        return multiplyScalar2(0.5, atan2(multiply2(2, aij, inv2(denom))));
      }
    }
    function Sij1(Sij, theta, i, j) {
      var N = Sij.length;
      var c = Math.cos(theta);
      var s = Math.sin(theta);
      var Ski = createArray(N, 0);
      var Skj = createArray(N, 0);
      for (var k = 0; k < N; k++) {
        Ski[k] = c * Sij[k][i] - s * Sij[k][j];
        Skj[k] = s * Sij[k][i] + c * Sij[k][j];
      }
      for (var _k = 0; _k < N; _k++) {
        Sij[_k][i] = Ski[_k];
        Sij[_k][j] = Skj[_k];
      }
      return Sij;
    }
    function Sij1Big(Sij, theta, i, j) {
      var N = Sij.length;
      var c = cos2(theta);
      var s = sin2(theta);
      var Ski = createArray(N, bignumber2(0));
      var Skj = createArray(N, bignumber2(0));
      for (var k = 0; k < N; k++) {
        Ski[k] = subtract2(multiplyScalar2(c, Sij[k][i]), multiplyScalar2(s, Sij[k][j]));
        Skj[k] = addScalar2(multiplyScalar2(s, Sij[k][i]), multiplyScalar2(c, Sij[k][j]));
      }
      for (var _k2 = 0; _k2 < N; _k2++) {
        Sij[_k2][i] = Ski[_k2];
        Sij[_k2][j] = Skj[_k2];
      }
      return Sij;
    }
    function x1Big(Hij, theta, i, j) {
      var N = Hij.length;
      var c = bignumber2(cos2(theta));
      var s = bignumber2(sin2(theta));
      var c2 = multiplyScalar2(c, c);
      var s2 = multiplyScalar2(s, s);
      var Aki = createArray(N, bignumber2(0));
      var Akj = createArray(N, bignumber2(0));
      var csHij = multiply2(bignumber2(2), c, s, Hij[i][j]);
      var Aii = addScalar2(subtract2(multiplyScalar2(c2, Hij[i][i]), csHij), multiplyScalar2(s2, Hij[j][j]));
      var Ajj = add2(multiplyScalar2(s2, Hij[i][i]), csHij, multiplyScalar2(c2, Hij[j][j]));
      for (var k = 0; k < N; k++) {
        Aki[k] = subtract2(multiplyScalar2(c, Hij[i][k]), multiplyScalar2(s, Hij[j][k]));
        Akj[k] = addScalar2(multiplyScalar2(s, Hij[i][k]), multiplyScalar2(c, Hij[j][k]));
      }
      Hij[i][i] = Aii;
      Hij[j][j] = Ajj;
      Hij[i][j] = bignumber2(0);
      Hij[j][i] = bignumber2(0);
      for (var _k3 = 0; _k3 < N; _k3++) {
        if (_k3 !== i && _k3 !== j) {
          Hij[i][_k3] = Aki[_k3];
          Hij[_k3][i] = Aki[_k3];
          Hij[j][_k3] = Akj[_k3];
          Hij[_k3][j] = Akj[_k3];
        }
      }
      return Hij;
    }
    function x1(Hij, theta, i, j) {
      var N = Hij.length;
      var c = Math.cos(theta);
      var s = Math.sin(theta);
      var c2 = c * c;
      var s2 = s * s;
      var Aki = createArray(N, 0);
      var Akj = createArray(N, 0);
      var Aii = c2 * Hij[i][i] - 2 * c * s * Hij[i][j] + s2 * Hij[j][j];
      var Ajj = s2 * Hij[i][i] + 2 * c * s * Hij[i][j] + c2 * Hij[j][j];
      for (var k = 0; k < N; k++) {
        Aki[k] = c * Hij[i][k] - s * Hij[j][k];
        Akj[k] = s * Hij[i][k] + c * Hij[j][k];
      }
      Hij[i][i] = Aii;
      Hij[j][j] = Ajj;
      Hij[i][j] = 0;
      Hij[j][i] = 0;
      for (var _k4 = 0; _k4 < N; _k4++) {
        if (_k4 !== i && _k4 !== j) {
          Hij[i][_k4] = Aki[_k4];
          Hij[_k4][i] = Aki[_k4];
          Hij[j][_k4] = Akj[_k4];
          Hij[_k4][j] = Akj[_k4];
        }
      }
      return Hij;
    }
    function getAij(Mij) {
      var N = Mij.length;
      var maxMij = 0;
      var maxIJ = [0, 1];
      for (var i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) {
          if (Math.abs(maxMij) < Math.abs(Mij[i][j])) {
            maxMij = Math.abs(Mij[i][j]);
            maxIJ = [i, j];
          }
        }
      }
      return [maxIJ, maxMij];
    }
    function getAijBig(Mij) {
      var N = Mij.length;
      var maxMij = 0;
      var maxIJ = [0, 1];
      for (var i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) {
          if (abs2(maxMij) < abs2(Mij[i][j])) {
            maxMij = abs2(Mij[i][j]);
            maxIJ = [i, j];
          }
        }
      }
      return [maxIJ, maxMij];
    }
    function sorting(E, S) {
      var N = E.length;
      var Ef = Array(N);
      var Sf = Array(N);
      for (var k = 0; k < N; k++) {
        Sf[k] = Array(N);
      }
      for (var i = 0; i < N; i++) {
        var minID = 0;
        var minE = E[0];
        for (var j = 0; j < E.length; j++) {
          if (E[j] < minE) {
            minID = j;
            minE = E[minID];
          }
        }
        Ef[i] = E.splice(minID, 1)[0];
        for (var _k5 = 0; _k5 < N; _k5++) {
          Sf[_k5][i] = S[_k5][minID];
          S[_k5].splice(minID, 1);
        }
      }
      return [clone(Ef), clone(Sf)];
    }
    function createArray(size2, value) {
      var array13 = new Array(size2);
      for (var i = 0; i < size2; i++) {
        array13[i] = value;
      }
      return array13;
    }
  });

  // node_modules/mathjs/lib/esm/function/geometry/intersect.js
  var name88 = "intersect";
  var dependencies89 = ["typed", "config", "abs", "add", "addScalar", "matrix", "multiply", "multiplyScalar", "divideScalar", "subtract", "smaller", "equalScalar"];
  var createIntersect = /* @__PURE__ */ factory(name88, dependencies89, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      abs: abs2,
      add: add2,
      addScalar: addScalar2,
      matrix: matrix2,
      multiply: multiply2,
      multiplyScalar: multiplyScalar2,
      divideScalar: divideScalar2,
      subtract: subtract2,
      smaller: smaller2,
      equalScalar: equalScalar2
    } = _ref;
    return typed2("intersect", {
      "Array, Array, Array": function ArrayArrayArray(x, y, plane) {
        if (!_3d(x)) {
          throw new TypeError("Array with 3 numbers or BigNumbers expected for first argument");
        }
        if (!_3d(y)) {
          throw new TypeError("Array with 3 numbers or BigNumbers expected for second argument");
        }
        if (!_4d(plane)) {
          throw new TypeError("Array with 4 numbers expected as third argument");
        }
        return _intersectLinePlane(x[0], x[1], x[2], y[0], y[1], y[2], plane[0], plane[1], plane[2], plane[3]);
      },
      "Array, Array, Array, Array": function ArrayArrayArrayArray(w, x, y, z) {
        if (w.length === 2) {
          if (!_2d(w)) {
            throw new TypeError("Array with 2 numbers or BigNumbers expected for first argument");
          }
          if (!_2d(x)) {
            throw new TypeError("Array with 2 numbers or BigNumbers expected for second argument");
          }
          if (!_2d(y)) {
            throw new TypeError("Array with 2 numbers or BigNumbers expected for third argument");
          }
          if (!_2d(z)) {
            throw new TypeError("Array with 2 numbers or BigNumbers expected for fourth argument");
          }
          return _intersect2d(w, x, y, z);
        } else if (w.length === 3) {
          if (!_3d(w)) {
            throw new TypeError("Array with 3 numbers or BigNumbers expected for first argument");
          }
          if (!_3d(x)) {
            throw new TypeError("Array with 3 numbers or BigNumbers expected for second argument");
          }
          if (!_3d(y)) {
            throw new TypeError("Array with 3 numbers or BigNumbers expected for third argument");
          }
          if (!_3d(z)) {
            throw new TypeError("Array with 3 numbers or BigNumbers expected for fourth argument");
          }
          return _intersect3d(w[0], w[1], w[2], x[0], x[1], x[2], y[0], y[1], y[2], z[0], z[1], z[2]);
        } else {
          throw new TypeError("Arrays with two or thee dimensional points expected");
        }
      },
      "Matrix, Matrix, Matrix": function MatrixMatrixMatrix(x, y, plane) {
        return matrix2(this(x.valueOf(), y.valueOf(), plane.valueOf()));
      },
      "Matrix, Matrix, Matrix, Matrix": function MatrixMatrixMatrixMatrix(w, x, y, z) {
        return matrix2(this(w.valueOf(), x.valueOf(), y.valueOf(), z.valueOf()));
      }
    });
    function _isNumeric(a) {
      return typeof a === "number" || isBigNumber(a);
    }
    function _2d(x) {
      return x.length === 2 && _isNumeric(x[0]) && _isNumeric(x[1]);
    }
    function _3d(x) {
      return x.length === 3 && _isNumeric(x[0]) && _isNumeric(x[1]) && _isNumeric(x[2]);
    }
    function _4d(x) {
      return x.length === 4 && _isNumeric(x[0]) && _isNumeric(x[1]) && _isNumeric(x[2]) && _isNumeric(x[3]);
    }
    function _intersect2d(p1a, p1b, p2a, p2b) {
      var o1 = p1a;
      var o2 = p2a;
      var d1 = subtract2(o1, p1b);
      var d2 = subtract2(o2, p2b);
      var det2 = subtract2(multiplyScalar2(d1[0], d2[1]), multiplyScalar2(d2[0], d1[1]));
      if (smaller2(abs2(det2), config5.epsilon)) {
        return null;
      }
      var d20o11 = multiplyScalar2(d2[0], o1[1]);
      var d21o10 = multiplyScalar2(d2[1], o1[0]);
      var d20o21 = multiplyScalar2(d2[0], o2[1]);
      var d21o20 = multiplyScalar2(d2[1], o2[0]);
      var t = divideScalar2(addScalar2(subtract2(subtract2(d20o11, d21o10), d20o21), d21o20), det2);
      return add2(multiply2(d1, t), o1);
    }
    function _intersect3dHelper(a, b, c, d, e3, f, g, h, i, j, k, l) {
      var add1 = multiplyScalar2(subtract2(a, b), subtract2(c, d));
      var add22 = multiplyScalar2(subtract2(e3, f), subtract2(g, h));
      var add3 = multiplyScalar2(subtract2(i, j), subtract2(k, l));
      return addScalar2(addScalar2(add1, add22), add3);
    }
    function _intersect3d(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) {
      var d1343 = _intersect3dHelper(x1, x3, x4, x3, y1, y3, y4, y3, z1, z3, z4, z3);
      var d4321 = _intersect3dHelper(x4, x3, x2, x1, y4, y3, y2, y1, z4, z3, z2, z1);
      var d1321 = _intersect3dHelper(x1, x3, x2, x1, y1, y3, y2, y1, z1, z3, z2, z1);
      var d4343 = _intersect3dHelper(x4, x3, x4, x3, y4, y3, y4, y3, z4, z3, z4, z3);
      var d2121 = _intersect3dHelper(x2, x1, x2, x1, y2, y1, y2, y1, z2, z1, z2, z1);
      var ta = divideScalar2(subtract2(multiplyScalar2(d1343, d4321), multiplyScalar2(d1321, d4343)), subtract2(multiplyScalar2(d2121, d4343), multiplyScalar2(d4321, d4321)));
      var tb = divideScalar2(addScalar2(d1343, multiplyScalar2(ta, d4321)), d4343);
      var pax = addScalar2(x1, multiplyScalar2(ta, subtract2(x2, x1)));
      var pay = addScalar2(y1, multiplyScalar2(ta, subtract2(y2, y1)));
      var paz = addScalar2(z1, multiplyScalar2(ta, subtract2(z2, z1)));
      var pbx = addScalar2(x3, multiplyScalar2(tb, subtract2(x4, x3)));
      var pby = addScalar2(y3, multiplyScalar2(tb, subtract2(y4, y3)));
      var pbz = addScalar2(z3, multiplyScalar2(tb, subtract2(z4, z3)));
      if (equalScalar2(pax, pbx) && equalScalar2(pay, pby) && equalScalar2(paz, pbz)) {
        return [pax, pay, paz];
      } else {
        return null;
      }
    }
    function _intersectLinePlane(x1, y1, z1, x2, y2, z2, x, y, z, c) {
      var x1x = multiplyScalar2(x1, x);
      var x2x = multiplyScalar2(x2, x);
      var y1y = multiplyScalar2(y1, y);
      var y2y = multiplyScalar2(y2, y);
      var z1z = multiplyScalar2(z1, z);
      var z2z = multiplyScalar2(z2, z);
      var t = divideScalar2(subtract2(subtract2(subtract2(c, x1x), y1y), z1z), subtract2(subtract2(subtract2(addScalar2(addScalar2(x2x, y2y), z2z), x1x), y1y), z1z));
      var px = addScalar2(x1, multiplyScalar2(t, subtract2(x2, x1)));
      var py = addScalar2(y1, multiplyScalar2(t, subtract2(y2, y1)));
      var pz = addScalar2(z1, multiplyScalar2(t, subtract2(z2, z1)));
      return [px, py, pz];
    }
  });

  // node_modules/mathjs/lib/esm/function/statistics/sum.js
  var name89 = "sum";
  var dependencies90 = ["typed", "config", "add", "numeric"];
  var createSum = /* @__PURE__ */ factory(name89, dependencies90, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      add: add2,
      numeric: numeric2
    } = _ref;
    return typed2(name89, {
      "Array | Matrix": _sum,
      "Array | Matrix, number | BigNumber": _nsumDim,
      "...": function _(args) {
        if (containsCollections(args)) {
          throw new TypeError("Scalar values expected in function sum");
        }
        return _sum(args);
      }
    });
    function _sum(array13) {
      var sum2;
      deepForEach(array13, function(value) {
        try {
          sum2 = sum2 === void 0 ? value : add2(sum2, value);
        } catch (err) {
          throw improveErrorMessage(err, "sum", value);
        }
      });
      if (sum2 === void 0) {
        sum2 = numeric2(0, config5.number);
      }
      if (typeof sum2 === "string") {
        sum2 = numeric2(sum2, config5.number);
      }
      return sum2;
    }
    function _nsumDim(array13, dim) {
      try {
        var sum2 = reduce(array13, dim, add2);
        return sum2;
      } catch (err) {
        throw improveErrorMessage(err, "sum");
      }
    }
  });

  // node_modules/mathjs/lib/esm/function/probability/gamma.js
  var name90 = "gamma";
  var dependencies91 = ["typed", "config", "multiplyScalar", "pow", "BigNumber", "Complex"];
  var createGamma = /* @__PURE__ */ factory(name90, dependencies91, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      multiplyScalar: multiplyScalar2,
      pow: pow2,
      BigNumber: _BigNumber,
      Complex: _Complex
    } = _ref;
    return typed2(name90, {
      number: gammaNumber,
      Complex: function Complex3(n) {
        if (n.im === 0) {
          return this(n.re);
        }
        n = new _Complex(n.re - 1, n.im);
        var x = new _Complex(gammaP[0], 0);
        for (var i = 1; i < gammaP.length; ++i) {
          var real = n.re + i;
          var den = real * real + n.im * n.im;
          if (den !== 0) {
            x.re += gammaP[i] * real / den;
            x.im += -(gammaP[i] * n.im) / den;
          } else {
            x.re = gammaP[i] < 0 ? -Infinity : Infinity;
          }
        }
        var t = new _Complex(n.re + gammaG + 0.5, n.im);
        var twoPiSqrt = Math.sqrt(2 * Math.PI);
        n.re += 0.5;
        var result = pow2(t, n);
        if (result.im === 0) {
          result.re *= twoPiSqrt;
        } else if (result.re === 0) {
          result.im *= twoPiSqrt;
        } else {
          result.re *= twoPiSqrt;
          result.im *= twoPiSqrt;
        }
        var r = Math.exp(-t.re);
        t.re = r * Math.cos(-t.im);
        t.im = r * Math.sin(-t.im);
        return multiplyScalar2(multiplyScalar2(result, t), x);
      },
      BigNumber: function BigNumber2(n) {
        if (n.isInteger()) {
          return n.isNegative() || n.isZero() ? new _BigNumber(Infinity) : bigFactorial(n.minus(1));
        }
        if (!n.isFinite()) {
          return new _BigNumber(n.isNegative() ? NaN : Infinity);
        }
        throw new Error("Integer BigNumber expected");
      },
      "Array | Matrix": function ArrayMatrix(n) {
        return deepMap(n, this);
      }
    });
    function bigFactorial(n) {
      if (n < 8) {
        return new _BigNumber([1, 1, 2, 6, 24, 120, 720, 5040][n]);
      }
      var precision = config5.precision + (Math.log(n.toNumber()) | 0);
      var Big = _BigNumber.clone({
        precision
      });
      if (n % 2 === 1) {
        return n.times(bigFactorial(new _BigNumber(n - 1)));
      }
      var p = n;
      var prod2 = new Big(n);
      var sum2 = n.toNumber();
      while (p > 2) {
        p -= 2;
        sum2 += p;
        prod2 = prod2.times(sum2);
      }
      return new _BigNumber(prod2.toPrecision(_BigNumber.precision));
    }
  });

  // node_modules/mathjs/lib/esm/function/probability/util/seededRNG.js
  const seedrandom = __toModule(require_seedrandom2());
  var singletonRandom = /* @__PURE__ */ seedrandom.default(Date.now());
  function createRng(randomSeed) {
    var random2;
    function setSeed(seed) {
      random2 = seed === null ? singletonRandom : seedrandom.default(String(seed));
    }
    setSeed(randomSeed);
    function rng() {
      return random2();
    }
    return rng;
  }

  // node_modules/mathjs/lib/esm/function/probability/pickRandom.js
  var name91 = "pickRandom";
  var dependencies92 = ["typed", "config", "?on"];
  var createPickRandom = /* @__PURE__ */ factory(name91, dependencies92, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      on
    } = _ref;
    var rng = createRng(config5.randomSeed);
    if (on) {
      on("config", function(curr, prev) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed);
        }
      });
    }
    return typed2({
      "Array | Matrix": function ArrayMatrix(possibles) {
        return _pickRandom(possibles, {});
      },
      "Array | Matrix, Object": function ArrayMatrixObject(possibles, options) {
        return _pickRandom(possibles, options);
      },
      "Array | Matrix, number": function ArrayMatrixNumber(possibles, number50) {
        return _pickRandom(possibles, {
          number: number50
        });
      },
      "Array | Matrix, Array | Matrix": function ArrayMatrixArrayMatrix(possibles, weights) {
        return _pickRandom(possibles, {
          weights
        });
      },
      "Array | Matrix, Array | Matrix, number": function ArrayMatrixArrayMatrixNumber(possibles, weights, number50) {
        return _pickRandom(possibles, {
          number: number50,
          weights
        });
      },
      "Array | Matrix, number, Array | Matrix": function ArrayMatrixNumberArrayMatrix(possibles, number50, weights) {
        return _pickRandom(possibles, {
          number: number50,
          weights
        });
      }
    });
    function _pickRandom(possibles, _ref2) {
      var {
        number: number50,
        weights,
        elementWise = true
      } = _ref2;
      var single = typeof number50 === "undefined";
      if (single) {
        number50 = 1;
      }
      var createMatrix2 = isMatrix(possibles) ? possibles.create : isMatrix(weights) ? weights.create : null;
      possibles = possibles.valueOf();
      if (weights) {
        weights = weights.valueOf();
      }
      if (elementWise === true) {
        possibles = flatten(possibles);
        weights = flatten(weights);
      }
      var totalWeights = 0;
      if (typeof weights !== "undefined") {
        if (weights.length !== possibles.length) {
          throw new Error("Weights must have the same length as possibles");
        }
        for (var i = 0, len = weights.length; i < len; i++) {
          if (!isNumber(weights[i]) || weights[i] < 0) {
            throw new Error("Weights must be an array of positive numbers");
          }
          totalWeights += weights[i];
        }
      }
      var length = possibles.length;
      var result = [];
      var pick;
      while (result.length < number50) {
        if (typeof weights === "undefined") {
          pick = possibles[Math.floor(rng() * length)];
        } else {
          var randKey = rng() * totalWeights;
          for (var _i = 0, _len = possibles.length; _i < _len; _i++) {
            randKey -= weights[_i];
            if (randKey < 0) {
              pick = possibles[_i];
              break;
            }
          }
        }
        result.push(pick);
      }
      return single ? result[0] : createMatrix2 ? createMatrix2(result) : result;
    }
  });

  // node_modules/mathjs/lib/esm/function/probability/util/randomMatrix.js
  function randomMatrix(size2, random2) {
    var data = [];
    size2 = size2.slice(0);
    if (size2.length > 1) {
      for (var i = 0, length = size2.shift(); i < length; i++) {
        data.push(randomMatrix(size2, random2));
      }
    } else {
      for (var _i = 0, _length = size2.shift(); _i < _length; _i++) {
        data.push(random2());
      }
    }
    return data;
  }

  // node_modules/mathjs/lib/esm/function/probability/random.js
  var name92 = "random";
  var dependencies93 = ["typed", "config", "?on"];
  var createRandom = /* @__PURE__ */ factory(name92, dependencies93, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      on
    } = _ref;
    var rng = createRng(config5.randomSeed);
    if (on) {
      on("config", function(curr, prev) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed);
        }
      });
    }
    return typed2(name92, {
      "": () => _random(0, 1),
      number: (max2) => _random(0, max2),
      "number, number": (min2, max2) => _random(min2, max2),
      "Array | Matrix": (size2) => _randomMatrix(size2, 0, 1),
      "Array | Matrix, number": (size2, max2) => _randomMatrix(size2, 0, max2),
      "Array | Matrix, number, number": (size2, min2, max2) => _randomMatrix(size2, min2, max2)
    });
    function _randomMatrix(size2, min2, max2) {
      var res = randomMatrix(size2.valueOf(), () => _random(min2, max2));
      return isMatrix(size2) ? size2.create(res) : res;
    }
    function _random(min2, max2) {
      return min2 + rng() * (max2 - min2);
    }
  });

  // node_modules/mathjs/lib/esm/function/probability/randomInt.js
  var name93 = "randomInt";
  var dependencies94 = ["typed", "config", "?on"];
  var createRandomInt = /* @__PURE__ */ factory(name93, dependencies94, (_ref) => {
    var {
      typed: typed2,
      config: config5,
      on
    } = _ref;
    var rng = createRng(config5.randomSeed);
    if (on) {
      on("config", function(curr, prev) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed);
        }
      });
    }
    return typed2(name93, {
      "": () => _randomInt(0, 1),
      number: (max2) => _randomInt(0, max2),
      "number, number": (min2, max2) => _randomInt(min2, max2),
      "Array | Matrix": (size2) => _randomIntMatrix(size2, 0, 1),
      "Array | Matrix, number": (size2, max2) => _randomIntMatrix(size2, 0, max2),
      "Array | Matrix, number, number": (size2, min2, max2) => _randomIntMatrix(size2, min2, max2)
    });
    function _randomIntMatrix(size2, min2, max2) {
      var res = randomMatrix(size2.valueOf(), () => _randomInt(min2, max2));
      return isMatrix(size2) ? size2.create(res) : res;
    }
    function _randomInt(min2, max2) {
      return Math.floor(min2 + rng() * (max2 - min2));
    }
  });

  // node_modules/mathjs/lib/esm/constants.js
  var createInfinity = /* @__PURE__ */ recreateFactory("Infinity", ["config", "?BigNumber"], (_ref) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref;
    return config5.number === "BigNumber" ? new BigNumber2(Infinity) : Infinity;
  });
  var createNaN = /* @__PURE__ */ recreateFactory("NaN", ["config", "?BigNumber"], (_ref2) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref2;
    return config5.number === "BigNumber" ? new BigNumber2(NaN) : NaN;
  });
  var createPi = /* @__PURE__ */ recreateFactory("pi", ["config", "?BigNumber"], (_ref3) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref3;
    return config5.number === "BigNumber" ? createBigNumberPi(BigNumber2) : pi;
  });
  var createTau = /* @__PURE__ */ recreateFactory("tau", ["config", "?BigNumber"], (_ref4) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref4;
    return config5.number === "BigNumber" ? createBigNumberTau(BigNumber2) : tau;
  });
  var createE = /* @__PURE__ */ recreateFactory("e", ["config", "?BigNumber"], (_ref5) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref5;
    return config5.number === "BigNumber" ? createBigNumberE(BigNumber2) : e;
  });
  var createPhi = /* @__PURE__ */ recreateFactory("phi", ["config", "?BigNumber"], (_ref6) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref6;
    return config5.number === "BigNumber" ? createBigNumberPhi(BigNumber2) : phi;
  });
  var createLN2 = /* @__PURE__ */ recreateFactory("LN2", ["config", "?BigNumber"], (_ref7) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref7;
    return config5.number === "BigNumber" ? new BigNumber2(2).ln() : Math.LN2;
  });
  var createLN10 = /* @__PURE__ */ recreateFactory("LN10", ["config", "?BigNumber"], (_ref8) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref8;
    return config5.number === "BigNumber" ? new BigNumber2(10).ln() : Math.LN10;
  });
  var createLOG2E = /* @__PURE__ */ recreateFactory("LOG2E", ["config", "?BigNumber"], (_ref9) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref9;
    return config5.number === "BigNumber" ? new BigNumber2(1).div(new BigNumber2(2).ln()) : Math.LOG2E;
  });
  var createLOG10E = /* @__PURE__ */ recreateFactory("LOG10E", ["config", "?BigNumber"], (_ref10) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref10;
    return config5.number === "BigNumber" ? new BigNumber2(1).div(new BigNumber2(10).ln()) : Math.LOG10E;
  });
  var createSQRT1_2 = /* @__PURE__ */ recreateFactory("SQRT1_2", ["config", "?BigNumber"], (_ref11) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref11;
    return config5.number === "BigNumber" ? new BigNumber2("0.5").sqrt() : Math.SQRT1_2;
  });
  var createSQRT2 = /* @__PURE__ */ recreateFactory("SQRT2", ["config", "?BigNumber"], (_ref12) => {
    var {
      config: config5,
      BigNumber: BigNumber2
    } = _ref12;
    return config5.number === "BigNumber" ? new BigNumber2(2).sqrt() : Math.SQRT2;
  });
  function recreateFactory(name94, dependencies95, create) {
    return factory(name94, dependencies95, create, {
      recreateOnConfigChange: true
    });
  }

  // node_modules/mathjs/lib/esm/type/unit/physicalConstants.js
  var createSpeedOfLight = /* @__PURE__ */ unitFactory("speedOfLight", "299792458", "m s^-1");
  var createGravitationConstant = /* @__PURE__ */ unitFactory("gravitationConstant", "6.67430e-11", "m^3 kg^-1 s^-2");
  var createPlanckConstant = /* @__PURE__ */ unitFactory("planckConstant", "6.62607015e-34", "J s");
  var createReducedPlanckConstant = /* @__PURE__ */ unitFactory("reducedPlanckConstant", "1.0545718176461565e-34", "J s");
  var createMagneticConstant = /* @__PURE__ */ unitFactory("magneticConstant", "1.25663706212e-6", "N A^-2");
  var createElectricConstant = /* @__PURE__ */ unitFactory("electricConstant", "8.8541878128e-12", "F m^-1");
  var createVacuumImpedance = /* @__PURE__ */ unitFactory("vacuumImpedance", "376.730313667", "ohm");
  var createCoulomb = /* @__PURE__ */ unitFactory("coulomb", "8.987551792261171e9", "N m^2 C^-2");
  var createElementaryCharge = /* @__PURE__ */ unitFactory("elementaryCharge", "1.602176634e-19", "C");
  var createBohrMagneton = /* @__PURE__ */ unitFactory("bohrMagneton", "9.2740100783e-24", "J T^-1");
  var createConductanceQuantum = /* @__PURE__ */ unitFactory("conductanceQuantum", "7.748091729863649e-5", "S");
  var createInverseConductanceQuantum = /* @__PURE__ */ unitFactory("inverseConductanceQuantum", "12906.403729652257", "ohm");
  var createMagneticFluxQuantum = /* @__PURE__ */ unitFactory("magneticFluxQuantum", "2.0678338484619295e-15", "Wb");
  var createNuclearMagneton = /* @__PURE__ */ unitFactory("nuclearMagneton", "5.0507837461e-27", "J T^-1");
  var createKlitzing = /* @__PURE__ */ unitFactory("klitzing", "25812.807459304513", "ohm");
  var createBohrRadius = /* @__PURE__ */ unitFactory("bohrRadius", "5.29177210903e-11", "m");
  var createClassicalElectronRadius = /* @__PURE__ */ unitFactory("classicalElectronRadius", "2.8179403262e-15", "m");
  var createElectronMass = /* @__PURE__ */ unitFactory("electronMass", "9.1093837015e-31", "kg");
  var createFermiCoupling = /* @__PURE__ */ unitFactory("fermiCoupling", "1.1663787e-5", "GeV^-2");
  var createFineStructure = numberFactory("fineStructure", 0.0072973525693);
  var createHartreeEnergy = /* @__PURE__ */ unitFactory("hartreeEnergy", "4.3597447222071e-18", "J");
  var createProtonMass = /* @__PURE__ */ unitFactory("protonMass", "1.67262192369e-27", "kg");
  var createDeuteronMass = /* @__PURE__ */ unitFactory("deuteronMass", "3.3435830926e-27", "kg");
  var createNeutronMass = /* @__PURE__ */ unitFactory("neutronMass", "1.6749271613e-27", "kg");
  var createQuantumOfCirculation = /* @__PURE__ */ unitFactory("quantumOfCirculation", "3.6369475516e-4", "m^2 s^-1");
  var createRydberg = /* @__PURE__ */ unitFactory("rydberg", "10973731.568160", "m^-1");
  var createThomsonCrossSection = /* @__PURE__ */ unitFactory("thomsonCrossSection", "6.6524587321e-29", "m^2");
  var createWeakMixingAngle = numberFactory("weakMixingAngle", 0.2229);
  var createEfimovFactor = numberFactory("efimovFactor", 22.7);
  var createAtomicMass = /* @__PURE__ */ unitFactory("atomicMass", "1.66053906660e-27", "kg");
  var createAvogadro = /* @__PURE__ */ unitFactory("avogadro", "6.02214076e23", "mol^-1");
  var createBoltzmann = /* @__PURE__ */ unitFactory("boltzmann", "1.380649e-23", "J K^-1");
  var createFaraday = /* @__PURE__ */ unitFactory("faraday", "96485.33212331001", "C mol^-1");
  var createFirstRadiation = /* @__PURE__ */ unitFactory("firstRadiation", "3.7417718521927573e-16", "W m^2");
  var createLoschmidt = /* @__PURE__ */ unitFactory("loschmidt", "2.686780111798444e25", "m^-3");
  var createGasConstant = /* @__PURE__ */ unitFactory("gasConstant", "8.31446261815324", "J K^-1 mol^-1");
  var createMolarPlanckConstant = /* @__PURE__ */ unitFactory("molarPlanckConstant", "3.990312712893431e-10", "J s mol^-1");
  var createMolarVolume = /* @__PURE__ */ unitFactory("molarVolume", "0.022413969545014137", "m^3 mol^-1");
  var createSackurTetrode = numberFactory("sackurTetrode", -1.16487052358);
  var createSecondRadiation = /* @__PURE__ */ unitFactory("secondRadiation", "0.014387768775039337", "m K");
  var createStefanBoltzmann = /* @__PURE__ */ unitFactory("stefanBoltzmann", "5.67037441918443e-8", "W m^-2 K^-4");
  var createWienDisplacement = /* @__PURE__ */ unitFactory("wienDisplacement", "2.897771955e-3", "m K");
  var createMolarMass = /* @__PURE__ */ unitFactory("molarMass", "0.99999999965e-3", "kg mol^-1");
  var createMolarMassC12 = /* @__PURE__ */ unitFactory("molarMassC12", "11.9999999958e-3", "kg mol^-1");
  var createGravity = /* @__PURE__ */ unitFactory("gravity", "9.80665", "m s^-2");
  var createPlanckLength = /* @__PURE__ */ unitFactory("planckLength", "1.616255e-35", "m");
  var createPlanckMass = /* @__PURE__ */ unitFactory("planckMass", "2.176435e-8", "kg");
  var createPlanckTime = /* @__PURE__ */ unitFactory("planckTime", "5.391245e-44", "s");
  var createPlanckCharge = /* @__PURE__ */ unitFactory("planckCharge", "1.87554603778e-18", "C");
  var createPlanckTemperature = /* @__PURE__ */ unitFactory("planckTemperature", "1.416785e+32", "K");
  function unitFactory(name94, valueStr, unitStr) {
    var dependencies95 = ["config", "Unit", "BigNumber"];
    return factory(name94, dependencies95, (_ref) => {
      var {
        config: config5,
        Unit: Unit2,
        BigNumber: BigNumber2
      } = _ref;
      var value = config5.number === "BigNumber" ? new BigNumber2(valueStr) : parseFloat(valueStr);
      var unit = new Unit2(value, unitStr);
      unit.fixPrefix = true;
      return unit;
    });
  }
  function numberFactory(name94, value) {
    var dependencies95 = ["config", "BigNumber"];
    return factory(name94, dependencies95, (_ref2) => {
      var {
        config: config5,
        BigNumber: BigNumber2
      } = _ref2;
      return config5.number === "BigNumber" ? new BigNumber2(value) : value;
    });
  }

  // node_modules/mathjs/lib/esm/entry/pureFunctionsAny.generated.js
  var Complex2 = /* @__PURE__ */ createComplexClass({});
  var BigNumber = /* @__PURE__ */ createBigNumberClass({
    config: config3
  });
  var Matrix = /* @__PURE__ */ createMatrixClass({});
  var LN10 = /* @__PURE__ */ createLN10({
    BigNumber,
    config: config3
  });
  var LOG10E = /* @__PURE__ */ createLOG10E({
    BigNumber,
    config: config3
  });
  var _NaN = /* @__PURE__ */ createNaN({
    BigNumber,
    config: config3
  });
  var pi2 = /* @__PURE__ */ createPi({
    BigNumber,
    config: config3
  });
  var SQRT1_2 = /* @__PURE__ */ createSQRT1_2({
    BigNumber,
    config: config3
  });
  var tau2 = /* @__PURE__ */ createTau({
    BigNumber,
    config: config3
  });
  var efimovFactor = /* @__PURE__ */ createEfimovFactor({
    BigNumber,
    config: config3
  });
  var fineStructure = /* @__PURE__ */ createFineStructure({
    BigNumber,
    config: config3
  });
  var sackurTetrode = /* @__PURE__ */ createSackurTetrode({
    BigNumber,
    config: config3
  });
  var weakMixingAngle = /* @__PURE__ */ createWeakMixingAngle({
    BigNumber,
    config: config3
  });
  var Fraction2 = /* @__PURE__ */ createFractionClass({});
  var e2 = /* @__PURE__ */ createE({
    BigNumber,
    config: config3
  });
  var _Infinity = /* @__PURE__ */ createInfinity({
    BigNumber,
    config: config3
  });
  var LOG2E = /* @__PURE__ */ createLOG2E({
    BigNumber,
    config: config3
  });
  var DenseMatrix = /* @__PURE__ */ createDenseMatrixClass({
    Matrix
  });
  var phi2 = /* @__PURE__ */ createPhi({
    BigNumber,
    config: config3
  });
  var typed = /* @__PURE__ */ createTyped({
    BigNumber,
    Complex: Complex2,
    DenseMatrix,
    Fraction: Fraction2
  });
  var isNumeric = /* @__PURE__ */ createIsNumeric({
    typed
  });
  var equalScalar = /* @__PURE__ */ createEqualScalar({
    config: config3,
    typed
  });
  var number49 = /* @__PURE__ */ createNumber({
    typed
  });
  var unaryPlus = /* @__PURE__ */ createUnaryPlus({
    BigNumber,
    config: config3,
    typed
  });
  var log103 = /* @__PURE__ */ createLog10({
    Complex: Complex2,
    config: config3,
    typed
  });
  var multiplyScalar = /* @__PURE__ */ createMultiplyScalar({
    typed
  });
  var format4 = /* @__PURE__ */ createFormat({
    typed
  });
  var acos = /* @__PURE__ */ createAcos({
    Complex: Complex2,
    config: config3,
    typed
  });
  var acsc = /* @__PURE__ */ createAcsc({
    BigNumber,
    Complex: Complex2,
    config: config3,
    typed
  });
  var asec = /* @__PURE__ */ createAsec({
    BigNumber,
    Complex: Complex2,
    config: config3,
    typed
  });
  var asin = /* @__PURE__ */ createAsin({
    Complex: Complex2,
    config: config3,
    typed
  });
  var atan = /* @__PURE__ */ createAtan({
    typed
  });
  var atanh2 = /* @__PURE__ */ createAtanh({
    Complex: Complex2,
    config: config3,
    typed
  });
  var pickRandom = /* @__PURE__ */ createPickRandom({
    config: config3,
    typed
  });
  var randomInt = /* @__PURE__ */ createRandomInt({
    config: config3,
    typed
  });
  var LN2 = /* @__PURE__ */ createLN2({
    BigNumber,
    config: config3
  });
  var fraction2 = /* @__PURE__ */ createFraction({
    Fraction: Fraction2,
    typed
  });
  var unaryMinus = /* @__PURE__ */ createUnaryMinus({
    typed
  });
  var addScalar = /* @__PURE__ */ createAddScalar({
    typed
  });
  var log23 = /* @__PURE__ */ createLog2({
    Complex: Complex2,
    config: config3,
    typed
  });
  var sqrt = /* @__PURE__ */ createSqrt({
    Complex: Complex2,
    config: config3,
    typed
  });
  var conj = /* @__PURE__ */ createConj({
    typed
  });
  var acosh2 = /* @__PURE__ */ createAcosh({
    Complex: Complex2,
    config: config3,
    typed
  });
  var cos = /* @__PURE__ */ createCos({
    typed
  });
  var sin = /* @__PURE__ */ createSin({
    typed
  });
  var random = /* @__PURE__ */ createRandom({
    config: config3,
    typed
  });
  var SQRT2 = /* @__PURE__ */ createSQRT2({
    BigNumber,
    config: config3
  });
  var isNegative = /* @__PURE__ */ createIsNegative({
    typed
  });
  var SparseMatrix = /* @__PURE__ */ createSparseMatrixClass({
    Matrix,
    equalScalar,
    typed
  });
  var matrix = /* @__PURE__ */ createMatrix({
    DenseMatrix,
    Matrix,
    SparseMatrix,
    typed
  });
  var cbrt3 = /* @__PURE__ */ createCbrt({
    BigNumber,
    Complex: Complex2,
    Fraction: Fraction2,
    config: config3,
    isNegative,
    matrix,
    typed,
    unaryMinus
  });
  var xgcd = /* @__PURE__ */ createXgcd({
    BigNumber,
    config: config3,
    matrix,
    typed
  });
  var identity = /* @__PURE__ */ createIdentity({
    BigNumber,
    DenseMatrix,
    SparseMatrix,
    config: config3,
    matrix,
    typed
  });
  var ones = /* @__PURE__ */ createOnes({
    BigNumber,
    config: config3,
    matrix,
    typed
  });
  var size = /* @__PURE__ */ createSize({
    matrix,
    config: config3,
    typed
  });
  var zeros2 = /* @__PURE__ */ createZeros({
    BigNumber,
    config: config3,
    matrix,
    typed
  });
  var round = /* @__PURE__ */ createRound({
    BigNumber,
    DenseMatrix,
    equalScalar,
    matrix,
    typed,
    zeros: zeros2
  });
  var compare = /* @__PURE__ */ createCompare({
    BigNumber,
    DenseMatrix,
    Fraction: Fraction2,
    config: config3,
    equalScalar,
    matrix,
    typed
  });
  var smaller = /* @__PURE__ */ createSmaller({
    DenseMatrix,
    config: config3,
    matrix,
    typed
  });
  var larger = /* @__PURE__ */ createLarger({
    DenseMatrix,
    config: config3,
    matrix,
    typed
  });
  var unequal = /* @__PURE__ */ createUnequal({
    DenseMatrix,
    config: config3,
    equalScalar,
    matrix,
    typed
  });
  var FibonacciHeap = /* @__PURE__ */ createFibonacciHeapClass({
    larger,
    smaller
  });
  var acoth = /* @__PURE__ */ createAcoth({
    BigNumber,
    Complex: Complex2,
    config: config3,
    typed
  });
  var add = /* @__PURE__ */ createAdd({
    DenseMatrix,
    SparseMatrix,
    addScalar,
    equalScalar,
    matrix,
    typed
  });
  var dot = /* @__PURE__ */ createDot({
    addScalar,
    conj,
    multiplyScalar,
    size,
    typed
  });
  var abs = /* @__PURE__ */ createAbs({
    typed
  });
  var floor = /* @__PURE__ */ createFloor({
    config: config3,
    equalScalar,
    matrix,
    round,
    typed
  });
  var multiply = /* @__PURE__ */ createMultiply({
    addScalar,
    dot,
    equalScalar,
    matrix,
    multiplyScalar,
    typed
  });
  var resize2 = /* @__PURE__ */ createResize({
    config: config3,
    matrix
  });
  var pow = /* @__PURE__ */ createPow({
    Complex: Complex2,
    config: config3,
    fraction: fraction2,
    identity,
    matrix,
    multiply,
    number: number49,
    typed
  });
  var largerEq = /* @__PURE__ */ createLargerEq({
    DenseMatrix,
    config: config3,
    matrix,
    typed
  });
  var asech = /* @__PURE__ */ createAsech({
    BigNumber,
    Complex: Complex2,
    config: config3,
    typed
  });
  var gamma = /* @__PURE__ */ createGamma({
    BigNumber,
    Complex: Complex2,
    config: config3,
    multiplyScalar,
    pow,
    typed
  });
  var bignumber = /* @__PURE__ */ createBignumber({
    BigNumber,
    typed
  });
  var transpose = /* @__PURE__ */ createTranspose({
    matrix,
    typed
  });
  var numeric = /* @__PURE__ */ createNumeric({
    bignumber,
    fraction: fraction2,
    number: number49
  });
  var smallerEq = /* @__PURE__ */ createSmallerEq({
    DenseMatrix,
    config: config3,
    matrix,
    typed
  });
  var min = /* @__PURE__ */ createMin({
    config: config3,
    numeric,
    smaller,
    typed
  });
  var sum = /* @__PURE__ */ createSum({
    add,
    config: config3,
    numeric,
    typed
  });
  var ceil = /* @__PURE__ */ createCeil({
    config: config3,
    equalScalar,
    matrix,
    round,
    typed
  });
  var subtract = /* @__PURE__ */ createSubtract({
    DenseMatrix,
    addScalar,
    equalScalar,
    matrix,
    typed,
    unaryMinus
  });
  var range = /* @__PURE__ */ createRange({
    bignumber,
    matrix,
    config: config3,
    larger,
    largerEq,
    smaller,
    smallerEq,
    typed
  });
  var prod = /* @__PURE__ */ createProd({
    config: config3,
    multiplyScalar,
    numeric,
    typed
  });
  var equal = /* @__PURE__ */ createEqual({
    DenseMatrix,
    equalScalar,
    matrix,
    typed
  });
  var max = /* @__PURE__ */ createMax({
    config: config3,
    larger,
    numeric,
    typed
  });
  var fix = /* @__PURE__ */ createFix({
    Complex: Complex2,
    ceil,
    floor,
    matrix,
    typed
  });
  var ctranspose = /* @__PURE__ */ createCtranspose({
    conj,
    transpose,
    typed
  });
  var divideScalar = /* @__PURE__ */ createDivideScalar({
    numeric,
    typed
  });
  var nthRoots = /* @__PURE__ */ createNthRoots({
    Complex: Complex2,
    config: config3,
    divideScalar,
    typed
  });
  var Spa = /* @__PURE__ */ createSpaClass({
    FibonacciHeap,
    addScalar,
    equalScalar
  });
  var lup = /* @__PURE__ */ createLup({
    DenseMatrix,
    Spa,
    SparseMatrix,
    abs,
    addScalar,
    divideScalar,
    equalScalar,
    larger,
    matrix,
    multiplyScalar,
    subtract,
    typed,
    unaryMinus
  });
  var det = /* @__PURE__ */ createDet({
    lup,
    matrix,
    multiply,
    subtract,
    typed,
    unaryMinus
  });
  var log = /* @__PURE__ */ createLog({
    Complex: Complex2,
    config: config3,
    divideScalar,
    typed
  });
  var inv = /* @__PURE__ */ createInv({
    abs,
    addScalar,
    det,
    divideScalar,
    identity,
    matrix,
    multiply,
    typed,
    unaryMinus
  });
  var log1p2 = /* @__PURE__ */ createLog1p({
    Complex: Complex2,
    config: config3,
    divideScalar,
    log,
    typed
  });
  var Unit = /* @__PURE__ */ createUnitClass({
    BigNumber,
    Complex: Complex2,
    Fraction: Fraction2,
    abs,
    addScalar,
    config: config3,
    divideScalar,
    equal,
    fix,
    format: format4,
    isNumeric,
    multiplyScalar,
    number: number49,
    pow,
    round,
    subtract
  });
  var eigs = /* @__PURE__ */ createEigs({
    abs,
    add,
    addScalar,
    atan,
    bignumber,
    config: config3,
    cos,
    equal,
    inv,
    matrix,
    multiply,
    multiplyScalar,
    sin,
    subtract,
    typed
  });
  var intersect = /* @__PURE__ */ createIntersect({
    abs,
    add,
    addScalar,
    config: config3,
    divideScalar,
    equalScalar,
    matrix,
    multiply,
    multiplyScalar,
    smaller,
    subtract,
    typed
  });
  var atomicMass = /* @__PURE__ */ createAtomicMass({
    BigNumber,
    Unit,
    config: config3
  });
  var bohrMagneton = /* @__PURE__ */ createBohrMagneton({
    BigNumber,
    Unit,
    config: config3
  });
  var boltzmann = /* @__PURE__ */ createBoltzmann({
    BigNumber,
    Unit,
    config: config3
  });
  var conductanceQuantum = /* @__PURE__ */ createConductanceQuantum({
    BigNumber,
    Unit,
    config: config3
  });
  var deuteronMass = /* @__PURE__ */ createDeuteronMass({
    BigNumber,
    Unit,
    config: config3
  });
  var electronMass = /* @__PURE__ */ createElectronMass({
    BigNumber,
    Unit,
    config: config3
  });
  var faraday = /* @__PURE__ */ createFaraday({
    BigNumber,
    Unit,
    config: config3
  });
  var firstRadiation = /* @__PURE__ */ createFirstRadiation({
    BigNumber,
    Unit,
    config: config3
  });
  var gravitationConstant = /* @__PURE__ */ createGravitationConstant({
    BigNumber,
    Unit,
    config: config3
  });
  var hartreeEnergy = /* @__PURE__ */ createHartreeEnergy({
    BigNumber,
    Unit,
    config: config3
  });
  var klitzing = /* @__PURE__ */ createKlitzing({
    BigNumber,
    Unit,
    config: config3
  });
  var magneticConstant = /* @__PURE__ */ createMagneticConstant({
    BigNumber,
    Unit,
    config: config3
  });
  var molarMass = /* @__PURE__ */ createMolarMass({
    BigNumber,
    Unit,
    config: config3
  });
  var molarPlanckConstant = /* @__PURE__ */ createMolarPlanckConstant({
    BigNumber,
    Unit,
    config: config3
  });
  var neutronMass = /* @__PURE__ */ createNeutronMass({
    BigNumber,
    Unit,
    config: config3
  });
  var planckCharge = /* @__PURE__ */ createPlanckCharge({
    BigNumber,
    Unit,
    config: config3
  });
  var planckLength = /* @__PURE__ */ createPlanckLength({
    BigNumber,
    Unit,
    config: config3
  });
  var planckTemperature = /* @__PURE__ */ createPlanckTemperature({
    BigNumber,
    Unit,
    config: config3
  });
  var protonMass = /* @__PURE__ */ createProtonMass({
    BigNumber,
    Unit,
    config: config3
  });
  var reducedPlanckConstant = /* @__PURE__ */ createReducedPlanckConstant({
    BigNumber,
    Unit,
    config: config3
  });
  var secondRadiation = /* @__PURE__ */ createSecondRadiation({
    BigNumber,
    Unit,
    config: config3
  });
  var stefanBoltzmann = /* @__PURE__ */ createStefanBoltzmann({
    BigNumber,
    Unit,
    config: config3
  });
  var vacuumImpedance = /* @__PURE__ */ createVacuumImpedance({
    BigNumber,
    Unit,
    config: config3
  });
  var norm = /* @__PURE__ */ createNorm({
    abs,
    add,
    conj,
    ctranspose,
    eigs,
    equalScalar,
    larger,
    matrix,
    multiply,
    pow,
    smaller,
    sqrt,
    typed
  });
  var avogadro = /* @__PURE__ */ createAvogadro({
    BigNumber,
    Unit,
    config: config3
  });
  var classicalElectronRadius = /* @__PURE__ */ createClassicalElectronRadius({
    BigNumber,
    Unit,
    config: config3
  });
  var electricConstant = /* @__PURE__ */ createElectricConstant({
    BigNumber,
    Unit,
    config: config3
  });
  var fermiCoupling = /* @__PURE__ */ createFermiCoupling({
    BigNumber,
    Unit,
    config: config3
  });
  var gravity = /* @__PURE__ */ createGravity({
    BigNumber,
    Unit,
    config: config3
  });
  var loschmidt = /* @__PURE__ */ createLoschmidt({
    BigNumber,
    Unit,
    config: config3
  });
  var molarMassC12 = /* @__PURE__ */ createMolarMassC12({
    BigNumber,
    Unit,
    config: config3
  });
  var nuclearMagneton = /* @__PURE__ */ createNuclearMagneton({
    BigNumber,
    Unit,
    config: config3
  });
  var planckMass = /* @__PURE__ */ createPlanckMass({
    BigNumber,
    Unit,
    config: config3
  });
  var quantumOfCirculation = /* @__PURE__ */ createQuantumOfCirculation({
    BigNumber,
    Unit,
    config: config3
  });
  var speedOfLight = /* @__PURE__ */ createSpeedOfLight({
    BigNumber,
    Unit,
    config: config3
  });
  var wienDisplacement = /* @__PURE__ */ createWienDisplacement({
    BigNumber,
    Unit,
    config: config3
  });
  var rotationMatrix = /* @__PURE__ */ createRotationMatrix({
    BigNumber,
    DenseMatrix,
    SparseMatrix,
    addScalar,
    config: config3,
    cos,
    matrix,
    multiplyScalar,
    norm,
    sin,
    typed,
    unaryMinus
  });
  var bohrRadius = /* @__PURE__ */ createBohrRadius({
    BigNumber,
    Unit,
    config: config3
  });
  var elementaryCharge = /* @__PURE__ */ createElementaryCharge({
    BigNumber,
    Unit,
    config: config3
  });
  var inverseConductanceQuantum = /* @__PURE__ */ createInverseConductanceQuantum({
    BigNumber,
    Unit,
    config: config3
  });
  var molarVolume = /* @__PURE__ */ createMolarVolume({
    BigNumber,
    Unit,
    config: config3
  });
  var planckTime = /* @__PURE__ */ createPlanckTime({
    BigNumber,
    Unit,
    config: config3
  });
  var thomsonCrossSection = /* @__PURE__ */ createThomsonCrossSection({
    BigNumber,
    Unit,
    config: config3
  });
  var coulomb = /* @__PURE__ */ createCoulomb({
    BigNumber,
    Unit,
    config: config3
  });
  var magneticFluxQuantum = /* @__PURE__ */ createMagneticFluxQuantum({
    BigNumber,
    Unit,
    config: config3
  });
  var rydberg = /* @__PURE__ */ createRydberg({
    BigNumber,
    Unit,
    config: config3
  });
  var gasConstant = /* @__PURE__ */ createGasConstant({
    BigNumber,
    Unit,
    config: config3
  });
  var planckConstant = /* @__PURE__ */ createPlanckConstant({
    BigNumber,
    Unit,
    config: config3
  });

  // src/workers/processImage/findHomographicTransform.ts
  function findHomographicTransform(size2, corners) {
    const A = zeros2(8, 8);
    A.set([0, 2], 1);
    A.set([1, 5], 1);
    A.set([2, 0], size2);
    A.set([2, 2], 1);
    A.set([2, 6], -size2 * corners.topRight.x);
    A.set([3, 3], size2);
    A.set([3, 5], 1);
    A.set([3, 6], -size2 * corners.topRight.y);
    A.set([4, 1], size2);
    A.set([4, 2], 1);
    A.set([4, 7], -size2 * corners.bottomLeft.x);
    A.set([5, 4], size2);
    A.set([5, 5], 1);
    A.set([5, 7], -size2 * corners.bottomLeft.y);
    A.set([6, 0], size2);
    A.set([6, 1], size2);
    A.set([6, 2], 1);
    A.set([6, 6], -size2 * corners.bottomRight.x);
    A.set([6, 7], -size2 * corners.bottomRight.x);
    A.set([7, 3], size2);
    A.set([7, 4], size2);
    A.set([7, 5], 1);
    A.set([7, 6], -size2 * corners.bottomRight.y);
    A.set([7, 7], -size2 * corners.bottomRight.y);
    const B = matrix([
      corners.topLeft.x,
      corners.topLeft.y,
      corners.topRight.x,
      corners.topRight.y,
      corners.bottomLeft.x,
      corners.bottomLeft.y,
      corners.bottomRight.x,
      corners.bottomRight.y
    ]);
    const A_t = transpose(A);
    const lamda = multiply(multiply(inv(multiply(A_t, A)), A_t), B);
    const a = lamda.get([0]);
    const b = lamda.get([1]);
    const c = lamda.get([2]);
    const d = lamda.get([3]);
    const e3 = lamda.get([4]);
    const f = lamda.get([5]);
    const g = lamda.get([6]);
    const h = lamda.get([7]);
    return {a, b, c, d, e: e3, f, g, h};
  }
  function transformPoint(point, tranform) {
    const {a, b, c, d, e: e3, f, g, h} = tranform;
    const {x, y} = point;
    const sxPre1 = b * y + c;
    const sxPre2 = h * y + 1;
    const syPre1 = e3 * y + f;
    const syPre2 = h * y + 1;
    const sx = Math.floor((a * x + sxPre1) / (g * x + sxPre2));
    const sy = Math.floor((d * x + syPre1) / (g * x + syPre2));
    return {x: sx, y: sy};
  }

  // src/workers/processImage/getCornerPoints.ts
  function getNearestPoint(points, x, y) {
    let closestPoint = points[0];
    let minDistance = Number.MAX_SAFE_INTEGER;
    points.forEach((point) => {
      const dx = Math.abs(point.x - x);
      const dy = Math.abs(point.y - y);
      const distance = dx + dy;
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    return closestPoint;
  }
  function getCornerPoints(region) {
    const {x: minX, y: minY} = region.bounds.topLeft;
    const {x: maxX, y: maxY} = region.bounds.bottomRight;
    const {points} = region;
    return {
      topLeft: getNearestPoint(points, minX, minY),
      topRight: getNearestPoint(points, maxX, minY),
      bottomLeft: getNearestPoint(points, minX, maxY),
      bottomRight: getNearestPoint(points, maxX, maxY)
    };
  }
  function sanityCheckCorners({
    topLeft,
    topRight,
    bottomLeft,
    bottomRight
  }) {
    function length(p1, p2) {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    const topLineLength = length(topLeft, topRight);
    const leftLineLength = length(topLeft, bottomLeft);
    const rightLineLength = length(topRight, bottomRight);
    const bottomLineLength = length(bottomLeft, bottomRight);
    if (topLineLength < 0.5 * bottomLineLength || topLineLength > 1.5 * bottomLineLength)
      return false;
    if (leftLineLength < 0.7 * rightLineLength || leftLineLength > 1.3 * rightLineLength)
      return false;
    if (leftLineLength < 0.5 * bottomLineLength || leftLineLength > 1.5 * bottomLineLength)
      return false;
    return true;
  }

  // src/workers/processImage/processImage.worker.ts
  const PROCESSING_SIZE = 900;
  onmessage = async function(e3) {
    let {imageData, width, height} = e3.data;
    let image = getImage(imageData, width, height);
    let corners = null;
    let gridLines = null;
    let boxes = null;
    const thresholded = adaptiveThreshold(image.clone(), 20, 20);
    const largestConnectedComponent = getLargestConnectedComponent(thresholded, {
      minAspectRatio: 0.5,
      maxAspectRatio: 1.5,
      minSize: Math.min(width, height) * 0.3,
      maxSize: Math.min(width, height) * 0.9
    });
    if (largestConnectedComponent) {
      corners = getCornerPoints(largestConnectedComponent);
      if (sanityCheckCorners(corners)) {
        const transform = findHomographicTransform(PROCESSING_SIZE, corners);
        gridLines = createGridLines(transform);
        const extractedImageGreyScale = extractSquareFromRegion(image, PROCESSING_SIZE, transform);
        const extractedImageThresholded = extractSquareFromRegion(thresholded, PROCESSING_SIZE, transform);
        boxes = extractBoxes(extractedImageGreyScale, extractedImageThresholded);
      }
    }
    self.postMessage({width, height, corners, gridLines, boxes});
  };
  const getImage = (imageData, width, height) => {
    const bytes = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const g = imageData.data[(row + x) * 4 + 1];
        bytes[row + x] = g;
      }
    }
    return new Image(bytes, width, height);
  };
  function createGridLines(transform) {
    const boxSize = PROCESSING_SIZE / 9;
    const gridLines = [];
    for (let l = 1; l < 9; l++) {
      gridLines.push({
        p1: transformPoint({x: 0, y: l * boxSize}, transform),
        p2: transformPoint({x: PROCESSING_SIZE, y: l * boxSize}, transform)
      });
      gridLines.push({
        p1: transformPoint({y: 0, x: l * boxSize}, transform),
        p2: transformPoint({y: PROCESSING_SIZE, x: l * boxSize}, transform)
      });
    }
    return gridLines;
  }
})();
