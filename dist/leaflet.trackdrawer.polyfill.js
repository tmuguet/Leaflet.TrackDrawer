(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],2:[function(_dereq_,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],3:[function(_dereq_,module,exports){
module.exports = _dereq_("regenerator-runtime");

},{"regenerator-runtime":5}],4:[function(_dereq_,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.hostname +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],5:[function(_dereq_,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],6:[function(_dereq_,module,exports){
"use strict";

var colorMap = {
  red: '#D63E2A',
  orange: '#F59630',
  green: '#72B026',
  blue: '#38AADD',
  purple: '#D252B9',
  darkred: '#A23336',
  darkblue: '#0067A3',
  darkgreen: '#728224',
  darkpurple: '#5B396B',
  cadetblue: '#436978',
  lightred: '#FF8E7F',
  beige: '#FFCB92',
  lightgreen: '#BBF970',
  lightblue: '#8ADAFF',
  pink: '#FF91EA',
  white: '#FBFBFB',
  lightgray: '#A3A3A3',
  gray: '#575757',
  black: '#303030'
};
var colors = ['blue', 'green', 'orange', 'purple', 'red', 'darkblue', 'darkpurple', 'lightblue', 'lightgreen', 'beige', 'pink', 'lightred']; // Colors supported by Leaflet AwesomeMarkers

Object.freeze(colorMap);
Object.freeze(colors);
module.exports = {
  nameOf: function nameOf(idx) {
    return colors[idx % colors.length];
  },
  rgbOf: function rgbOf(idx) {
    return colorMap[this.nameOf(idx)];
  },
  nameToRgb: function nameToRgb(name) {
    return colorMap[name];
  },
  rgbToName: function rgbToName(rgb) {
    return Object.keys(colorMap).find(function (key) {
      return colorMap[key] === rgb;
    });
  }
};

},{}],7:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Edge = L.Polyline.extend({
  _startMarkerId: undefined,
  _endMarkerId: undefined,
  _promoted: false,
  _demoted: true,
  _computation: 0,
  options: {
    metadata: {}
  },
  initialize: function initialize(latlngs, options) {
    L.Polyline.prototype.initialize.call(this, latlngs, options);
    L.setOptions(this, options);
    this.options.metadata = JSON.parse(JSON.stringify(this.options.metadata));
  }
});
module.exports = {
  Edge: Edge,
  edge: function edge(latlngs, options) {
    return new Edge(latlngs, options);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);
/**
 * Splits an array of LatLng objects every X meters
 * @param {L.LatLng[]} latlngs Polyline to split
 * @param {int} distance Max. distance of each segment of the polyline (in meters)
 * @returns L.LatLng[][]
 */


function splitLatLngs(latlngs) {
  var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  if (distance <= 0) throw new Error('`distance` must be positive');
  if (latlngs.length === 0) return [[]];
  var result = [];

  if (Array.isArray(latlngs[0])) {
    for (var j = 0; j < latlngs.length; j += 1) {
      result = result.concat(splitLatLngs(latlngs[j], distance));
    }

    return result;
  }

  var tmp = latlngs.splice(0, 1);

  while (latlngs.length > 0) {
    var latlng = L.latLng(latlngs.splice(0, 1)[0]);
    tmp.push(latlng);

    if (latlng.distanceTo(tmp[0]) > distance) {
      result.push(tmp);
      tmp = [latlng];
    }
  }

  result.push(tmp);
  return result;
}
/**
 * Splits a L.Polyline object every X meters
 * @param {L.Polyline} polyline Polyline to split
 * @param {int} distance Max. distance of each segment of the polyline (in meters)
 * @returns L.Polyline[]
 */


function splitPolyline(polyline) {
  var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  return splitLatLngs(polyline.getLatLngs(), distance).map(function (a) {
    return L.polyline(a);
  });
}

function featureGroupToPolylines(featureGroup) {
  return featureGroup.getLayers().filter(function (layer) {
    return layer instanceof L.Polyline;
  });
}

function featureGroupToLatLngs(featureGroup) {
  return featureGroupToPolylines(featureGroup).map(function (layer) {
    return [layer.getLatLngs(), layer.feature.properties];
  });
}

module.exports = {
  splitPolyline: splitPolyline,
  splitLatLngs: splitLatLngs,
  featureGroupToPolylines: featureGroupToPolylines,
  featureGroupToLatLngs: featureGroupToLatLngs
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

module.exports = L.Evented.extend({
  initialize: function initialize(parent) {
    this._parent = parent;
    var f = L.featureGroup().addTo(parent).addEventParent(this);
    this._elements = [f];
    this.length = 1;
  },
  get: function get(i) {
    var idx = i < 0 ? this._elements.length + i : i;
    return this._elements[idx];
  },

  /* eslint-disable prefer-rest-params */
  splice: function splice() {
    var _this$_elements,
        _this = this;

    var ret = (_this$_elements = this._elements).splice.apply(_this$_elements, arguments);

    ret.forEach(function (x) {
      return x.removeFrom(_this._parent).removeEventParent(_this);
    });

    if (arguments.length > 2) {
      var args = Array.prototype.slice.call(arguments, 2);
      args.forEach(function (x) {
        x.addTo(_this._parent).addEventParent(_this);
      });
    }

    this.length = this._elements.length;
    return ret;
  },

  /* eslint-enable prefer-rest-params */
  forEach: function forEach(cb) {
    this._elements.forEach(cb);
  },
  clean: function clean() {
    this._elements[0].clearLayers();

    this.splice(1);
  },
  getLayer: function getLayer(id) {
    var parentLayer = this._elements.find(function (x) {
      return x.getLayer(id) !== undefined;
    });

    return parentLayer !== undefined ? parentLayer.getLayer(id) : undefined;
  },
  getLayerId: function getLayerId(layer) {
    var parentLayer = this._elements.find(function (x) {
      return x.hasLayer(layer);
    });

    return parentLayer !== undefined ? parentLayer.getLayerId(layer) : undefined;
  },
  getLayerIndex: function getLayerIndex(layer) {
    return this._elements.findIndex(function (x) {
      return x.hasLayer(layer);
    });
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(_dereq_("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/asyncToGenerator"));

/* eslint-disable arrow-parens */
var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var corslite = _dereq_('@mapbox/corslite');

var _require = _dereq_('./Track'),
    Track = _require.Track;

var latlngutils = _dereq_('./LatLngUtils');

if (L.FileLayer !== undefined) {
  Track.include({
    _createFileLoader: function _createFileLoader() {
      this._fileLoader = L.FileLayer.fileLoader(null, {
        addToMap: false,
        fileSizeLimit: this.options.fileSizeLimit || 1024,
        formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx']
      });
    },
    createFileLoaderControl: function createFileLoaderControl() {
      var _this = this;

      var insertWaypoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      this._fileLoaderController = L.Control.fileLayerLoad({
        addToMap: false,
        fileSizeLimit: this.options.fileSizeLimit || 1024,
        formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx']
      }).addTo(this._map);

      this._fileLoaderController.loader.on('data:loaded', function (event) {
        _this._dataLoadedHandler(event.layer, insertWaypoints);
      });

      return this._fileLoaderController;
    },
    _dataLoadedHandler: function () {
      var _dataLoadedHandler2 = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee(layer) {
        var _this2 = this;

        var insertWaypoints,
            oldValue,
            latlngs,
            lastMarker,
            hasToolbar,
            _loop,
            i,
            _args3 = arguments;

        return _regenerator["default"].wrap(function _callee$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                insertWaypoints = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : false;

                this._fireStart();

                oldValue = this._fireEvents;
                this._fireEvents = false;
                this.clean();
                latlngs = insertWaypoints ? latlngutils.featureGroupToLatLngs(layer).map(function (l) {
                  return [latlngutils.splitLatLngs(l[0]), l[1]];
                }) : latlngutils.featureGroupToLatLngs(layer).map(function (l) {
                  return [[l[0]], l[1]];
                });
                hasToolbar = this._toolbar !== undefined;
                /* eslint-disable no-await-in-loop */

                _loop =
                /*#__PURE__*/
                _regenerator["default"].mark(function _loop(i) {
                  var properties, _loop2, j;

                  return _regenerator["default"].wrap(function _loop$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          properties = latlngs[i][1];
                          _loop2 =
                          /*#__PURE__*/
                          _regenerator["default"].mark(function _loop2(j) {
                            var l;
                            return _regenerator["default"].wrap(function _loop2$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    l = latlngs[i][0][j];

                                    if (!(l.length > 0)) {
                                      _context.next = 11;
                                      break;
                                    }

                                    if (!(lastMarker === undefined)) {
                                      _context.next = 7;
                                      break;
                                    }

                                    lastMarker = L.TrackDrawer.node(l[0]);
                                    _context.next = 6;
                                    return _this2.addNode(lastMarker, undefined, true);

                                  case 6:
                                    if (hasToolbar) _this2._bindMarkerEvents(lastMarker);

                                  case 7:
                                    lastMarker = L.TrackDrawer.node(l[l.length - 1], {
                                      type: j === latlngs[i][0].length - 1 ? 'stopover' : 'waypoint'
                                    });
                                    _context.next = 10;
                                    return _this2.addNode(lastMarker, function (_n1, _n2, cb) {
                                      cb(null, l, properties);
                                    }, true);

                                  case 10:
                                    if (hasToolbar) _this2._bindMarkerEvents(lastMarker);

                                  case 11:
                                  case "end":
                                    return _context.stop();
                                }
                              }
                            }, _loop2);
                          });
                          j = 0;

                        case 3:
                          if (!(j < latlngs[i][0].length)) {
                            _context2.next = 8;
                            break;
                          }

                          return _context2.delegateYield(_loop2(j), "t0", 5);

                        case 5:
                          j += 1;
                          _context2.next = 3;
                          break;

                        case 8:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _loop);
                });
                i = 0;

              case 9:
                if (!(i < latlngs.length)) {
                  _context3.next = 14;
                  break;
                }

                return _context3.delegateYield(_loop(i), "t0", 11);

              case 11:
                i += 1;
                _context3.next = 9;
                break;

              case 14:
                /* eslint-enable no-await-in-loop */
                this._fireEvents = oldValue;

                this._fireDone();

              case 16:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee, this);
      }));

      function _dataLoadedHandler(_x) {
        return _dataLoadedHandler2.apply(this, arguments);
      }

      return _dataLoadedHandler;
    }(),
    loadData: function loadData(data, name, ext) {
      var _this3 = this;

      var insertWaypoints = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      return new Promise(function (resolve, reject) {
        _this3._fileLoader.on('data:loaded',
        /*#__PURE__*/
        function () {
          var _ref = (0, _asyncToGenerator2["default"])(
          /*#__PURE__*/
          _regenerator["default"].mark(function _callee2(event) {
            return _regenerator["default"].wrap(function _callee2$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return _this3._dataLoadedHandler(event.layer, insertWaypoints);

                  case 2:
                    _this3._fileLoader.off();

                    resolve();

                  case 4:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee2);
          }));

          return function (_x2) {
            return _ref.apply(this, arguments);
          };
        }());

        _this3._fileLoader.on('data:error', function (error) {
          _this3._fileLoader.off();

          reject(error.error);
        });

        _this3._fileLoader.loadData(data, name, ext);
      });
    },
    loadFile: function loadFile(file) {
      var _this4 = this;

      var insertWaypoints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return new Promise(function (resolve, reject) {
        _this4._fileLoader.on('data:loaded',
        /*#__PURE__*/
        function () {
          var _ref2 = (0, _asyncToGenerator2["default"])(
          /*#__PURE__*/
          _regenerator["default"].mark(function _callee3(event) {
            return _regenerator["default"].wrap(function _callee3$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.next = 2;
                    return _this4._dataLoadedHandler(event.layer, insertWaypoints);

                  case 2:
                    _this4._fileLoader.off();

                    resolve();

                  case 4:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee3);
          }));

          return function (_x3) {
            return _ref2.apply(this, arguments);
          };
        }());

        _this4._fileLoader.on('data:error', function (error) {
          _this4._fileLoader.off();

          reject(error.error);
        });

        _this4._fileLoader.load(file);
      });
    },
    loadUrl: function loadUrl(url) {
      var _this5 = this;

      var useProxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var insertWaypoints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var filename = url.split('/').pop();
      var ext = filename.split('.').pop();
      var proxiedUrl = useProxy ? "fetch.php?url=".concat(encodeURI(url)) : url;
      return new Promise(function (resolve, reject) {
        corslite(proxiedUrl, function (err, resp) {
          if (!err) {
            try {
              _this5._fileLoader.on('data:loaded',
              /*#__PURE__*/
              function () {
                var _ref3 = (0, _asyncToGenerator2["default"])(
                /*#__PURE__*/
                _regenerator["default"].mark(function _callee4(event) {
                  return _regenerator["default"].wrap(function _callee4$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          _context6.next = 2;
                          return _this5._dataLoadedHandler(event.layer, insertWaypoints);

                        case 2:
                          _this5._fileLoader.off();

                          resolve();

                        case 4:
                        case "end":
                          return _context6.stop();
                      }
                    }
                  }, _callee4);
                }));

                return function (_x4) {
                  return _ref3.apply(this, arguments);
                };
              }());

              _this5._fileLoader.on('data:error', function (error) {
                _this5._fileLoader.off();

                reject(error.error);
              });

              _this5._fileLoader.loadData(resp.responseText, filename, ext);
            } catch (ex) {
              reject(ex);
            }
          } else if (err.responseText) {
            try {
              // Check if response is JSON
              var data = JSON.parse(err.responseText);
              reject(new Error(data.error));
            } catch (ex) {
              reject(new Error(err.statusText));
            }
          } else if (err.statusText) {
            reject(new Error(err.statusText));
          } else {
            reject(new Error(err));
          }
        }, false);
      });
    }
  });
  Track.addInitHook('_createFileLoader');
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./LatLngUtils":8,"./Track":14,"@babel/runtime/helpers/asyncToGenerator":1,"@babel/runtime/helpers/interopRequireDefault":2,"@babel/runtime/regenerator":3,"@mapbox/corslite":4}],11:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Node = L.Marker.extend({
  _routeIdPrevious: undefined,
  _routeIdNext: undefined,
  _promoted: false,
  _demoted: true,
  options: {
    type: 'waypoint',
    // Or 'stopover',
    colorName: 'blue',
    opacity: 1,
    draggable: true,
    metadata: {}
  },
  initialize: function initialize(latlng, options) {
    L.Marker.prototype.initialize.call(this, latlng, options);
    L.setOptions(this, options);
    this.setType(this.options.type);
    this.options.metadata = JSON.parse(JSON.stringify(this.options.metadata));
  },
  setType: function setType(type) {
    this.options.type = type;

    if (type === 'stopover') {
      this.setIcon(L.AwesomeMarkers.icon({
        icon: 'pause-circle',
        markerColor: this.options.colorName,
        prefix: 'fa'
      }));
    } else {
      this.setIcon(L.AwesomeMarkers.icon({
        icon: 'map-signs',
        markerColor: this.options.colorName,
        prefix: 'fa'
      }));
    }

    return this;
  },
  setStyle: function setStyle(style) {
    L.Util.setOptions(this, style);

    if ('colorName' in style) {
      // Colors is set only via the icon and there's no setter on L.AwesomeMarkers
      this.setType(this.options.type);
    }

    if ('opacity' in style) {
      this.setOpacity(this.options.opacity);
    }

    return this;
  }
});
module.exports = {
  Node: Node,
  node: function node(latlng, options) {
    return new Node(latlng, options);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

if (L.Control.EasyBar === undefined) {
  module.exports = {
    ToolBar: undefined,
    toolBar: undefined
  };
} else {
  var ToolBar = L.Control.EasyBar.extend({
    options: {
      mode: null,
      labelAddMarker: 'Add marker on click',
      labelInsertMarker: 'Insert marker when clicking on track',
      labelCloseLoop: 'Close the loop',
      labelDeleteMarker: 'Delete marker on click',
      labelPromoteMarker: 'Promote to stopover on click',
      labelDemoteMarker: 'Demote to waypoint on click',
      labelClean: 'Remove everything now',
      labelUndo: 'Undo',
      labelRedo: 'Redo'
    },
    initialize: function initialize(track, options) {
      var _this = this;

      this._track = track;
      L.Util.setOptions(this, options);
      L.Control.EasyBar.prototype.initialize.call(this, this._initializeButtons(), options);
      this.setMode(this.options.mode);

      this._track.getStepsContainer().on('click', function (e) {
        if (_this.options.mode === 'insert') {
          var marker = L.TrackDrawer.node(e.latlng);
          var route = e.layer;
          route.setStyle({
            weight: 3
          });

          _this._track.insertNode(marker, route);

          _this._bindMarkerEvents(marker);
        }
      });

      this._track.getStepsContainer().on('mouseover', function (e) {
        if (_this.options.mode === 'insert') {
          e.layer.setStyle({
            weight: 5
          });
        }
      });

      this._track.getStepsContainer().on('mouseout', function (e) {
        if (_this.options.mode === 'insert') {
          e.layer.setStyle({
            weight: 3
          });
        }
      });

      this._track._toolbar = this;

      this._track._bindMarkerEvents = function (marker) {
        _this._bindMarkerEvents(marker);
      };
    },
    setMode: function setMode(m) {
      this.options.mode = m;

      this._addBtn.state('loaded');

      this._insertBtn.state('loaded');

      this._deleteBtn.state('loaded');

      this._promoteBtn.state('loaded');

      this._demoteBtn.state('loaded');

      if (this._map) {
        this._map.getContainer().style.cursor = '';
      }

      switch (this.options.mode) {
        case 'add':
          {
            this._addBtn.state('active');

            if (this._map) {
              this._map.getContainer().style.cursor = 'pointer';
            }

            break;
          }

        case 'insert':
          {
            this._insertBtn.state('active');

            break;
          }

        case 'delete':
          {
            this._deleteBtn.state('active');

            break;
          }

        case 'promote':
          {
            this._promoteBtn.state('active');

            break;
          }

        case 'demote':
          {
            this._demoteBtn.state('active');

            break;
          }

        default: // Do nothing

      }

      return this;
    },
    _initializeButtons: function _initializeButtons() {
      var _this2 = this;

      var buttons = [];
      this._addBtn = L.easyButton({
        id: 'trackdrawer-add',
        states: [{
          stateName: 'loaded',
          icon: 'fa-plus',
          title: this.options.labelAddMarker,
          onClick: function onClick() {
            _this2.setMode('add');
          }
        }, {
          stateName: 'active',
          icon: 'fa-plus',
          title: this.options.labelAddMarker,
          onClick: function onClick() {
            _this2.setMode(null);
          }
        }]
      });
      buttons.push(this._addBtn);
      this._insertBtn = L.easyButton({
        id: 'trackdrawer-insert',
        states: [{
          stateName: 'loaded',
          icon: 'fa-plus-circle',
          title: this.options.labelInsertMarker,
          onClick: function onClick() {
            _this2.setMode('insert');
          }
        }, {
          stateName: 'active',
          icon: 'fa-plus-circle',
          title: this.options.labelInsertMarker,
          onClick: function onClick() {
            _this2.setMode(null);
          }
        }]
      });
      buttons.push(this._insertBtn);
      this._closeLoop = L.easyButton({
        id: 'trackdrawer-closeloop',
        states: [{
          stateName: 'loaded',
          icon: 'fa-magic',
          title: this.options.labelCloseLoop,
          onClick: function onClick() {
            if (_this2._track.hasNodes(2)) {
              var nodes = _this2._track.getNodes();

              var marker = L.TrackDrawer.node(nodes[0].markers[0].getLatLng()).addTo(_this2._track);

              _this2._bindMarkerEvents(marker);
            }
          }
        }]
      });
      buttons.push(this._closeLoop);
      this._deleteBtn = L.easyButton({
        id: 'trackdrawer-delete',
        states: [{
          stateName: 'loaded',
          icon: 'fa-eraser',
          title: this.options.labelDeleteMarker,
          onClick: function onClick() {
            _this2.setMode('delete');
          }
        }, {
          stateName: 'active',
          icon: 'fa-eraser',
          title: this.options.labelDeleteMarker,
          onClick: function onClick() {
            _this2.setMode(null);
          }
        }]
      });
      buttons.push(this._deleteBtn);
      this._promoteBtn = L.easyButton({
        id: 'trackdrawer-promote',
        states: [{
          stateName: 'loaded',
          icon: 'fa-pause-circle',
          title: this.options.labelPromoteMarker,
          onClick: function onClick() {
            _this2.setMode('promote');
          }
        }, {
          stateName: 'active',
          icon: 'fa-pause-circle',
          title: this.options.labelPromoteMarker,
          onClick: function onClick() {
            _this2.setMode(null);
          }
        }]
      });
      buttons.push(this._promoteBtn);
      this._demoteBtn = L.easyButton({
        id: 'trackdrawer-demote',
        states: [{
          stateName: 'loaded',
          icon: 'fa-map-signs',
          title: this.options.labelDemoteMarker,
          onClick: function onClick() {
            _this2.setMode('demote');
          }
        }, {
          stateName: 'active',
          icon: 'fa-map-signs',
          title: this.options.labelDemoteMarker,
          onClick: function onClick() {
            _this2.setMode(null);
          }
        }]
      });
      buttons.push(this._demoteBtn);
      this._cleanBtn = L.easyButton({
        id: 'trackdrawer-clean',
        states: [{
          icon: 'fa-trash',
          title: this.options.labelClean,
          onClick: function onClick() {
            _this2._track.clean();
          }
        }]
      });
      buttons.push(this._cleanBtn);

      if (this._track.options.undoable) {
        this._undoBtn = L.easyButton({
          id: 'trackdrawer-undo',
          states: [{
            icon: 'fa-undo',
            title: this.options.labelUndo,
            onClick: function onClick() {
              _this2._track.undo(function (latlng) {
                var marker = L.TrackDrawer.node(latlng);

                _this2._bindMarkerEvents(marker);

                return marker;
              });
            }
          }]
        });
        buttons.push(this._undoBtn);
        this._redoBtn = L.easyButton({
          id: 'trackdrawer-redo',
          states: [{
            icon: 'fa-repeat',
            title: this.options.labelRedo,
            onClick: function onClick() {
              _this2._track.redo(function (latlng) {
                var marker = L.TrackDrawer.node(latlng);

                _this2._bindMarkerEvents(marker);

                return marker;
              });
            }
          }]
        });
        buttons.push(this._redoBtn);
      }

      this._track.on('TrackDrawer:start', function () {
        if (_this2._track.options.undoable) {
          _this2._undoBtn.disable();

          _this2._redoBtn.disable();
        }
      });

      this._track.on('TrackDrawer:done', function () {
        if (_this2._track.hasNodes(2)) {
          _this2._closeLoop.enable();
        } else {
          _this2._closeLoop.disable();
        }

        if (_this2._track.hasNodes()) {
          _this2._insertBtn.enable();

          _this2._deleteBtn.enable();

          _this2._promoteBtn.enable();

          _this2._demoteBtn.enable();

          _this2._cleanBtn.enable();
        } else {
          _this2._insertBtn.disable();

          _this2._deleteBtn.disable();

          _this2._promoteBtn.disable();

          _this2._demoteBtn.disable();

          _this2._cleanBtn.disable();
        }

        if (_this2._track.options.undoable) {
          if (_this2._track.isUndoable()) {
            _this2._undoBtn.enable();
          } else {
            _this2._undoBtn.disable();
          }

          if (_this2._track.isRedoable()) {
            _this2._redoBtn.enable();
          } else {
            _this2._redoBtn.disable();
          }
        }
      });

      return buttons;
    },
    _bindMarkerEvents: function _bindMarkerEvents(marker) {
      marker.on('click', this._onMarkerClickHandler);
      marker.on('mouseover', this._onMarkerMouseOverHandler);
      marker.on('mouseout', this._onMarkerMouseOutHandler);
      return this;
    },
    onAdd: function onAdd(map) {
      var _this3 = this;

      this._onMapClickHandler = function (e) {
        if (_this3.options.mode === 'add') {
          var marker = L.TrackDrawer.node(e.latlng).addTo(_this3._track);

          _this3._bindMarkerEvents(marker);
        }
      };

      this._onMarkerClickHandler = function (e) {
        var marker = e.target;

        switch (_this3.options.mode) {
          case 'delete':
            {
              var _this3$_track$_getPre = _this3._track._getPrevious(marker),
                  previousEdge = _this3$_track$_getPre.previousEdge;

              var _this3$_track$_getNex = _this3._track._getNext(marker),
                  nextEdge = _this3$_track$_getNex.nextEdge;

              if (previousEdge) previousEdge.setStyle({
                weight: 3
              });
              if (nextEdge) nextEdge.setStyle({
                weight: 3
              });

              _this3._track.removeNode(marker);

              break;
            }

          case 'promote':
            {
              _this3._track.promoteNodeToStopover(marker);

              break;
            }

          case 'demote':
            {
              _this3._track.demoteNodeToWaypoint(marker);

              break;
            }

          default:
        }
      };

      this._onMarkerMouseOverHandler = function (e) {
        if (_this3.options.mode === 'delete' || _this3.options.mode === 'promote' || _this3.options.mode === 'demote') {
          var marker = e.target;

          var _this3$_track$_getPre2 = _this3._track._getPrevious(marker),
              previousEdge = _this3$_track$_getPre2.previousEdge;

          var _this3$_track$_getNex2 = _this3._track._getNext(marker),
              nextEdge = _this3$_track$_getNex2.nextEdge;

          if (previousEdge) previousEdge.setStyle({
            weight: 5
          });
          if (nextEdge) nextEdge.setStyle({
            weight: 5
          });
        }
      };

      this._onMarkerMouseOutHandler = function (e) {
        var marker = e.target;

        var _this3$_track$_getPre3 = _this3._track._getPrevious(marker),
            previousEdge = _this3$_track$_getPre3.previousEdge;

        var _this3$_track$_getNex3 = _this3._track._getNext(marker),
            nextEdge = _this3$_track$_getNex3.nextEdge;

        if (previousEdge) previousEdge.setStyle({
          weight: 3
        });
        if (nextEdge) nextEdge.setStyle({
          weight: 3
        });
      };

      L.DomEvent.on(map, 'click', this._onMapClickHandler);
      return L.Control.EasyBar.prototype.onAdd.call(this, map);
    },
    onRemove: function onRemove(map) {
      var _this4 = this;

      if (this.options.mode === 'add') map.getContainer().style.cursor = '';
      L.DomEvent.off(map, 'click', this._onMapClickHandler);

      this._track.getNodes().forEach(function (nodes) {
        nodes.markers.forEach(function (marker) {
          marker.off('click', _this4._onMarkerClickHandler);
          marker.off('mouseover', _this4._onMarkerMouseOverHandler);
          marker.off('mouseout', _this4._onMarkerMouseOutHandler);
        });
      });
    }
  });
  module.exports = {
    ToolBar: ToolBar,
    toolBar: function toolBar(track, options) {
      return new ToolBar(track, options);
    }
  };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

if (L.Control.EasyBar === undefined) {
  module.exports = {
    TraceModeBar: undefined,
    traceModeBar: undefined
  };
} else {
  var TraceModeBar = L.Control.EasyBar.extend({
    options: {
      mode: null
    },
    initialize: function initialize(track, modes, options) {
      this._track = track;
      this._buttonsMap = {};
      L.Control.EasyBar.prototype.initialize.call(this, this._initializeButtons(modes), options);
      this.setMode(this.options.mode);
    },
    setMode: function setMode(m) {
      var _this = this;

      var ids = Object.keys(this._buttonsMap);
      var newMode = m;

      if (newMode === null) {
        var idx = this.options.mode === ids[0] ? 1 : 0;
        newMode = ids[idx];
      }

      this.options.mode = newMode;
      ids.forEach(function (key) {
        _this._buttonsMap[key].btn.state('loaded');
      });

      this._buttonsMap[newMode].btn.state('active');

      this._track.setOptions({
        router: this._buttonsMap[newMode].router,
        routingCallback: this._buttonsMap[newMode].routingCallback
      });

      return this;
    },
    _initializeButtons: function _initializeButtons(modes) {
      var _this2 = this;

      var buttons = [];
      modes.forEach(function (m) {
        var btn = L.easyButton({
          id: "trackdrawer-mode-".concat(m.id),
          states: [{
            stateName: 'loaded',
            icon: m.icon,
            title: m.name,
            onClick: function onClick() {
              _this2.setMode(m.id);
            }
          }, {
            stateName: 'active',
            icon: m.icon,
            title: m.name,
            onClick: function onClick() {
              _this2.setMode(null);
            }
          }]
        });
        buttons.push(btn);
        _this2._buttonsMap[m.id] = {
          router: m.router,
          routingCallback: m.routingCallback,
          btn: btn
        };
      });
      return buttons;
    }
  });
  module.exports = {
    TraceModeBar: TraceModeBar,
    traceModeBar: function traceModeBar(track, modes, options) {
      return new TraceModeBar(track, modes, options);
    }
  };
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(_dereq_,module,exports){
(function (global){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(_dereq_("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/asyncToGenerator"));

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Colors = _dereq_('./Colors');

var LayerContainer = _dereq_('./LayerContainer');

var _require = _dereq_('./Edge'),
    Edge = _require.Edge;

function encodeLatLngs(latlngs) {
  var array = [];
  var size = latlngs.length;

  for (var i = 0; i < size; i += 1) {
    array.push(latlngs[i].lat);
    array.push(latlngs[i].lng);
  }

  return array;
  /* polyline with precision of 8 seems broken
     var array = latlngs.map(function(x) {
      return [x.lat, x.lng];
    });
     return polyline.encode(array, 8); //
    */
}

function decodeLatLngs(latlngs) {
  var array = [];
  var size = latlngs.length;

  for (var i = 0; i < size; i += 2) {
    array.push(L.latLng(latlngs[i], latlngs[i + 1]));
  }

  return array;
  /* polyline with precision of 8 seems broken
     var decoded = polyline.decode(latlngs, 8);
     return decoded.map(function(x) {
      return L.latLng(x[0], x[1]);
    });
    */
}

function encodeLatLng(latlng) {
  return [latlng.lat, latlng.lng];
}

function decodeLatLng(latlng) {
  return L.latLng(latlng[0], latlng[1]);
}

var Track = L.LayerGroup.extend({
  options: {
    routingCallback: undefined,
    router: undefined,
    debug: false,
    undoable: true,
    undoDepth: 30
  },
  _getPrevious: function _getPrevious(node) {
    var previousEdge = node !== undefined ? this._getEdge(node._routeIdPrevious) : undefined;
    var previousNode = previousEdge !== undefined ? this._getNode(previousEdge._startMarkerId) : undefined;
    return {
      previousEdge: previousEdge,
      previousNode: previousNode
    };
  },
  _getNext: function _getNext(node) {
    var nextEdge = node !== undefined ? this._getEdge(node._routeIdNext) : undefined;
    var nextNode = nextEdge !== undefined ? this._getNode(nextEdge._endMarkerId) : undefined;
    return {
      nextEdge: nextEdge,
      nextNode: nextNode
    };
  },
  _getNodeId: function _getNodeId(node) {
    return this._nodesContainers.getLayerId(node);
  },
  _getEdgeId: function _getEdgeId(edge) {
    return this._edgesContainers.getLayerId(edge);
  },
  _getNode: function _getNode(id) {
    return this._nodesContainers.getLayer(id);
  },
  _getEdge: function _getEdge(id) {
    return this._edgesContainers.getLayer(id);
  },
  _getNodeContainerIndex: function _getNodeContainerIndex(node) {
    return this._nodesContainers.getLayerIndex(node);
  },
  _getNodeContainer: function _getNodeContainer(node) {
    return this._nodesContainers.get(this._getNodeContainerIndex(node));
  },
  _getEdgeContainerIndex: function _getEdgeContainerIndex(edge) {
    return this._edgesContainers.getLayerIndex(edge);
  },
  _getEdgeContainer: function _getEdgeContainer(edge) {
    return this._edgesContainers.get(this._getEdgeContainerIndex(edge));
  },
  initialize: function initialize(options) {
    this.setOptions(options);
    L.LayerGroup.prototype.initialize.call(this);
    this._nodesContainers = new LayerContainer(this);
    this._edgesContainers = new LayerContainer(this);
    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentColorIndex = 0;
    this._fireEvents = true;
    this._computing = 0;
    this._states = null;
    this._currentStateIndex = null;

    if (this.options.undoable) {
      this._states = [];

      this._states.push(this.getState());

      this._currentStateIndex = 0;
    }
  },
  setOptions: function setOptions(options) {
    var _this = this;

    L.setOptions(this, options);

    if (this.options.router !== undefined) {
      this.options.routingCallback = function (previousMarker, marker, done) {
        _this.options.router.route([L.Routing.waypoint(previousMarker.getLatLng()), L.Routing.waypoint(marker.getLatLng())], function (err, result) {
          done(err, result ? result[0].coordinates : null, {});
        });
      };
    }
  },
  hasNodes: function hasNodes() {
    var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    var counter = 0;

    this._nodesContainers.forEach(function (container) {
      var group = container.getLayers();
      counter += group.length;
    });

    return counter >= count;
  },
  getNodes: function getNodes() {
    var nodes = [];

    this._nodesContainers.forEach(function (container) {
      var group = container.getLayers();
      if (group.length > 0) nodes.push({
        container: container,
        markers: group
      });
    });

    return nodes;
  },
  getNodesContainer: function getNodesContainer() {
    return this._nodesContainers;
  },
  getSteps: function getSteps() {
    var steps = [];

    this._edgesContainers.forEach(function (container) {
      var group = container.getLayers();
      if (group.length > 0) steps.push({
        container: container,
        edges: group
      });
    });

    return steps;
  },
  getStepsContainer: function getStepsContainer() {
    return this._edgesContainers;
  },
  getBounds: function getBounds() {
    var bounds = L.latLngBounds([]);

    this._nodesContainers.forEach(function (container) {
      bounds.extend(container.getBounds());
    });

    this._edgesContainers.forEach(function (container) {
      bounds.extend(container.getBounds());
    });

    return bounds;
  },
  getLatLngs: function getLatLngs() {
    var _this2 = this;

    var hasTrackStats = L.TrackStats !== undefined;
    var latlngs = [];

    var currentNode = this._getNode(this._firstNodeId);

    this._nodesContainers.forEach(function () {
      var l = [];

      do {
        var _this2$_getNext = _this2._getNext(currentNode),
            nextEdge = _this2$_getNext.nextEdge,
            nextNode = _this2$_getNext.nextNode;

        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        nextEdge.getLatLngs().forEach(function (e) {
          l.push(hasTrackStats ? L.TrackStats.cache.getAll(e) : e);
        });
        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');

      latlngs.push(JSON.parse(JSON.stringify(l)));
    });

    return latlngs;
  },
  _stopoversToGeoJSON: function _stopoversToGeoJSON() {
    var _this3 = this;

    var stopovers = [];
    var features = [];

    var currentNode = this._getNode(this._firstNodeId);

    if (currentNode !== undefined) {
      stopovers.push(currentNode);
    }

    this._nodesContainers.forEach(function () {
      do {
        var _this3$_getNext = _this3._getNext(currentNode),
            nextEdge = _this3$_getNext.nextEdge,
            nextNode = _this3$_getNext.nextNode;

        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');

      if (currentNode !== undefined) {
        stopovers.push(currentNode);
      }
    });

    var hasTrackStats = L.TrackStats !== undefined;
    stopovers.forEach(function (node, idx) {
      var e = hasTrackStats ? L.TrackStats.cache.getAll(node.getLatLng()) : node.getLatLng();
      var properties = JSON.parse(JSON.stringify(node.options.metadata));
      properties.index = idx;
      features.push({
        type: 'Feature',
        properties: properties,
        geometry: {
          type: 'Point',
          coordinates: 'z' in e && e.z !== null ? [e.lng, e.lat, e.z] : [e.lng, e.lat]
        }
      });
    });
    return features;
  },
  _edgesToFlatGeoJSON: function _edgesToFlatGeoJSON() {
    var _this4 = this;

    var hasTrackStats = L.TrackStats !== undefined;
    var feature = {
      type: 'Feature',
      properties: {
        index: 0
      },
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    };

    var currentNode = this._getNode(this._firstNodeId);

    this._nodesContainers.forEach(function () {
      do {
        var _this4$_getNext = _this4._getNext(currentNode),
            nextEdge = _this4$_getNext.nextEdge,
            nextNode = _this4$_getNext.nextNode;

        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        nextEdge.getLatLngs().forEach(function (e) {
          var e2 = hasTrackStats ? L.TrackStats.cache.getAll(e) : e;
          feature.geometry.coordinates.push('z' in e2 && e2.z !== null ? [e2.lng, e2.lat, e2.z] : [e2.lng, e2.lat]);
        });
        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');
    });

    return feature;
  },
  _edgesToGeoJSON: function _edgesToGeoJSON() {
    var _this5 = this;

    var hasTrackStats = L.TrackStats !== undefined;
    var features = [];

    var currentNode = this._getNode(this._firstNodeId);

    this._nodesContainers.forEach(function (_c, idx) {
      var _loop = function _loop() {
        var _this5$_getNext = _this5._getNext(currentNode),
            nextEdge = _this5$_getNext.nextEdge,
            nextNode = _this5$_getNext.nextNode;

        if (currentNode === undefined || nextEdge === undefined) {
          return "break";
        }

        var properties = JSON.parse(JSON.stringify(nextEdge.options.metadata));
        properties.index = idx;
        var feature = {
          type: 'Feature',
          properties: properties,
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        };
        nextEdge.getLatLngs().forEach(function (e) {
          var e2 = hasTrackStats ? L.TrackStats.cache.getAll(e) : e;
          feature.geometry.coordinates.push('z' in e2 && e2.z !== null ? [e2.lng, e2.lat, e2.z] : [e2.lng, e2.lat]);
        });
        features.push(feature);
        currentNode = nextNode;
      };

      do {
        var _ret = _loop();

        if (_ret === "break") break;
      } while (currentNode.options.type !== 'stopover');
    });

    return features;
  },
  toGeoJSON: function toGeoJSON() {
    var exportStopovers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var exportAsFlat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var geojson = {
      type: 'FeatureCollection',
      features: []
    };

    if (exportStopovers) {
      this._stopoversToGeoJSON().forEach(function (f) {
        return geojson.features.push(f);
      });
    }

    if (exportAsFlat) {
      geojson.features.push(this._edgesToFlatGeoJSON());
    } else {
      this._edgesToGeoJSON().forEach(function (f) {
        return geojson.features.push(f);
      });
    }

    return geojson;
  },
  getState: function getState() {
    var _this6 = this;

    var state = [{
      version: 2,
      start: undefined,
      metadata: undefined
    }];

    var currentNode = this._getNode(this._firstNodeId);

    if (currentNode !== undefined) {
      state[0].start = encodeLatLng(currentNode.getLatLng());
      state[0].metadata = JSON.parse(JSON.stringify(currentNode.options.metadata));
    }

    this._nodesContainers.forEach(function () {
      var group = [];

      do {
        var _this6$_getNext = _this6._getNext(currentNode),
            nextEdge = _this6$_getNext.nextEdge,
            nextNode = _this6$_getNext.nextNode;

        if (currentNode === undefined || nextEdge === undefined) {
          break;
        }

        group.push({
          end: encodeLatLng(nextNode.getLatLng()),
          edge: encodeLatLngs(nextEdge.getLatLngs()),
          metadata: {
            node: JSON.parse(JSON.stringify(nextNode.options.metadata)),
            edge: JSON.parse(JSON.stringify(nextEdge.options.metadata))
          }
        });
        currentNode = nextNode;
      } while (currentNode.options.type !== 'stopover');

      if (group.length > 0) state.push(group);
    });

    return state;
  },
  _fireStart: function _fireStart() {
    var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (this._fireEvents && this._computing === 0) this.fire('TrackDrawer:start', payload);
    this._computing += 1;
  },
  _fireDone: function _fireDone() {
    var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this._computing -= 1; // TODO: find a way to store states while computing

    if (this._fireEvents && this._computing === 0) this._pushState();
    if (this._fireEvents && this._computing === 0) this.fire('TrackDrawer:done', payload);
  },
  _fireFailed: function _fireFailed(error) {
    this._computing -= 1;
    if (this._fireEvents && this._computing === 0) this.fire('TrackDrawer:failed', {
      message: error.message
    });
  },
  refreshEdges: function () {
    var _refreshEdges = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee(routingCallback) {
      var _this7 = this;

      var callback, oldValue, promises;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              callback = routingCallback || this.options.routingCallback;

              this._fireStart();

              oldValue = this._fireEvents;
              this._fireEvents = false;
              promises = [];

              this._nodesContainers.forEach(function (container) {
                var markers = container.getLayers();
                markers.forEach(function (marker) {
                  promises.push(_this7.onMoveNode(marker, callback));
                });
              });

              _context.next = 8;
              return Promise.all(promises);

            case 8:
              this._fireEvents = oldValue;

              this._fireDone();

              return _context.abrupt("return", this);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function refreshEdges(_x) {
      return _refreshEdges.apply(this, arguments);
    }

    return refreshEdges;
  }(),
  clean: function clean() {
    this._fireStart();

    this._edgesContainers.clean();

    this._nodesContainers.clean();

    this._firstNodeId = undefined;
    this._lastNodeId = undefined;
    this._currentColorIndex = 0;

    this._fireDone();

    return this;
  },
  _createNode: function _createNode(latlng) {
    var metadata = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return L.TrackDrawer.node(latlng, {
      metadata: metadata
    });
  },
  restoreState: function () {
    var _restoreState = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee2(state, nodeCallback) {
      var _this8 = this;

      var callback, oldValue, stopovers, routes, promises, version;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              callback = nodeCallback || this._createNode;

              this._fireStart();

              oldValue = this._fireEvents;
              this._fireEvents = false;
              this.clean();
              stopovers = [];
              routes = [];
              promises = [];
              state.forEach(function (group, i) {
                if (i === 0) {
                  // eslint-disable-next-line prefer-destructuring
                  version = group.version;

                  if (group.start) {
                    var marker = callback.call(null, decodeLatLng(group.start), version >= 2 ? group.metadata : {});
                    promises.push(_this8.addNode(marker, function () {
                      throw new Error('Should not be called');
                    }, true));
                  }

                  return;
                }

                group.forEach(function (segment, j) {
                  var marker = callback.call(null, decodeLatLng(segment.end), version >= 2 ? segment.metadata.node : {});

                  if (j === group.length - 1 && i < state.length - 1) {
                    stopovers.push(marker);
                  }

                  promises.push(_this8.addNode(marker, function (from, to, done) {
                    var edge = decodeLatLngs(segment.edge);
                    routes.push({
                      from: from,
                      to: to,
                      edge: edge
                    });
                    done(null, edge, version >= 2 ? segment.metadata.edge : {});
                  }, true));
                });
              });
              _context2.next = 11;
              return Promise.all(promises);

            case 11:
              stopovers.forEach(function (m) {
                return _this8.promoteNodeToStopover(m);
              });
              this._fireEvents = oldValue;

              this._fireDone({
                routes: routes
              });

              return _context2.abrupt("return", this);

            case 15:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function restoreState(_x2, _x3) {
      return _restoreState.apply(this, arguments);
    }

    return restoreState;
  }(),
  _pushState: function _pushState() {
    if (this.options.undoable && !this._undoing) {
      if (this._currentStateIndex + 1 !== this._states.length) {
        this._states.splice(this._currentStateIndex + 1);
      }

      this._currentStateIndex += 1;

      this._states.push(this.getState());

      if (this._states.length - 1 > this.options.undoDepth) {
        this._states.splice(0, 1);

        this._currentStateIndex -= 1;
      }
    }
  },
  undo: function () {
    var _undo = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3(nodeCallback) {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(this.isUndoable() && this._computing === 0)) {
                _context3.next = 7;
                break;
              }

              this._currentStateIndex -= 1;
              this._undoing = true;
              _context3.next = 5;
              return this.restoreState(this._states[this._currentStateIndex], nodeCallback);

            case 5:
              this._undoing = false;
              return _context3.abrupt("return", true);

            case 7:
              return _context3.abrupt("return", false);

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function undo(_x4) {
      return _undo.apply(this, arguments);
    }

    return undo;
  }(),
  isUndoable: function isUndoable() {
    return this.options.undoable && this._currentStateIndex > 0;
  },
  isRedoable: function isRedoable() {
    return this.options.undoable && this._currentStateIndex < this._states.length - 1;
  },
  redo: function () {
    var _redo = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee4(nodeCallback) {
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!(this.isRedoable() && this._computing === 0)) {
                _context4.next = 7;
                break;
              }

              this._currentStateIndex += 1;
              this._undoing = true;
              _context4.next = 5;
              return this.restoreState(this._states[this._currentStateIndex], nodeCallback);

            case 5:
              this._undoing = false;
              return _context4.abrupt("return", true);

            case 7:
              return _context4.abrupt("return", false);

            case 8:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function redo(_x5) {
      return _redo.apply(this, arguments);
    }

    return redo;
  }(),
  addLayer: function addLayer(layer) {
    if (layer instanceof L.Marker) {
      this.addNode(layer);
    } else {
      L.LayerGroup.prototype.addLayer.call(this, layer);
    }
  },
  _createEdge: function _createEdge(previousNode, node) {
    var _this9 = this;

    var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var edgesContainer = this._edgesContainers.get(this._getNodeContainerIndex(previousNode));

    var edge = new Edge([previousNode.getLatLng(), node.getLatLng()], {
      color: Colors.nameToRgb(previousNode.options.colorName),
      dashArray: '4',
      metadata: metadata
    }).addTo(edgesContainer);
    var id = edgesContainer.getLayerId(edge);
    previousNode._routeIdNext = id;
    node._routeIdPrevious = id;
    edge._startMarkerId = this._getNodeId(previousNode);
    edge._endMarkerId = this._getNodeId(node);
    edge._computation = 0;

    if (this.options.debug) {
      edge.on('tooltipopen', function () {
        var startNodeId = edge._startMarkerId;
        var endNodeId = edge._endMarkerId;
        edge.setTooltipContent("id: ".concat(_this9._getEdgeId(edge), " (on #").concat(_this9._getEdgeContainerIndex(edge), ")<br>") + "previous node: ".concat(startNodeId) + " (on #".concat(_this9._getNodeContainerIndex(_this9._getNode(startNodeId)), ")<br>") + "next node: ".concat(endNodeId) + " (on #".concat(_this9._getNodeContainerIndex(_this9._getNode(endNodeId)), ")"));
      });
      edge.bindTooltip('<>');
    }

    return edge;
  },
  _prepareNode: function _prepareNode(node, nodesContainer) {
    var _this10 = this;

    if (this.options.debug) {
      node.on('tooltipopen', function () {
        var _this10$_getPrevious = _this10._getPrevious(node),
            previousEdge = _this10$_getPrevious.previousEdge,
            previousNode = _this10$_getPrevious.previousNode;

        var _this10$_getNext = _this10._getNext(node),
            nextEdge = _this10$_getNext.nextEdge,
            nextNode = _this10$_getNext.nextNode;

        node.setTooltipContent("id: ".concat(_this10._getNodeId(node), " (on #").concat(_this10._getNodeContainerIndex(node), ")<br>") + "previous edge: ".concat(_this10._getEdgeId(previousEdge)) + " (on #".concat(_this10._getEdgeContainerIndex(previousEdge), ") to ").concat(_this10._getNodeId(previousNode), "<br>") + "next edge: ".concat(_this10._getEdgeId(nextEdge)) + " (on #".concat(_this10._getEdgeContainerIndex(nextEdge), ") to ").concat(_this10._getNodeId(nextNode)));
      });
      node.bindTooltip('<>');
    }

    if (nodesContainer.getLayers().length > 0) {
      var previousNode = nodesContainer.getLayers()[0];
      node.setStyle({
        colorName: previousNode.options.colorName
      });
    } else {
      node.setStyle({
        colorName: Colors.nameOf(this._currentColorIndex)
      });
    }

    if (node.options.draggable) {
      node.on('dragstart', function (e) {
        return _this10._onDragStartNode(e.target);
      });
      node.on('drag', function (e) {
        return _this10._onDragNode(e.target);
      });
      node.on('moveend', function (e) {
        return _this10.onMoveNode(e.target);
      });
    }

    node.addTo(nodesContainer);
    return this;
  },
  addNode: function addNode(node, routingCallback) {
    var _this11 = this;

    var skipChecks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var callback = routingCallback || this.options.routingCallback;

    if (this._lastNodeId !== undefined && !skipChecks) {
      var _previousNode = this._getNode(this._lastNodeId);

      if (_previousNode.getLatLng().equals(node.getLatLng())) {
        return new Promise(function (resolve) {
          resolve();
        });
      }
    }

    this._fireStart();

    var nodesContainer = this._nodesContainers.get(-1);

    this._prepareNode(node, nodesContainer);

    if (this._lastNodeId !== undefined) {
      var _previousNode2 = this._getNode(this._lastNodeId);

      this._createEdge(_previousNode2, node);
    }

    var lastNodeId = this._lastNodeId;
    this._lastNodeId = this._getNodeId(node);

    if (this._firstNodeId === undefined) {
      this._firstNodeId = this._lastNodeId;
    }

    var oldValue = this._fireEvents;
    this._fireEvents = false;

    if (node.options.type === 'stopover') {
      this.promoteNodeToStopover(node);
    }

    this._fireEvents = oldValue;

    if (lastNodeId === undefined) {
      return new Promise(function (resolve) {
        resolve();
      }).then(function () {
        _this11._fireDone({});
      });
    }

    var _this$_getPrevious = this._getPrevious(node),
        previousEdge = _this$_getPrevious.previousEdge,
        previousNode = _this$_getPrevious.previousNode;

    previousEdge._computation += 1;
    var currentComputation = previousEdge._computation;
    return new Promise(function (resolve, reject) {
      callback.call(null, previousNode, node, function (err, route) {
        var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (err !== null) {
          reject(err);
          return;
        }

        if (previousEdge._computation === currentComputation) {
          // Route can give different precision than initial markers
          // Use precision given by the route to be consistent
          previousNode.setLatLng(L.latLng(route[0]));
          node.setLatLng(L.latLng(route[route.length - 1]));
          previousEdge.setLatLngs(route);
          previousEdge.options.metadata = JSON.parse(JSON.stringify(metadata));
          previousEdge.setStyle({
            dashArray: null
          });
        }

        resolve({
          routes: [{
            from: previousNode,
            to: node,
            previousEdge: previousEdge
          }]
        });
      });
    }).then(function (routes) {
      _this11._fireDone({
        routes: routes
      });
    })["catch"](function (e) {
      _this11._fireFailed(e);
    });
  },
  insertNode: function insertNode(node, route, routingCallback) {
    var _this12 = this;

    var callback = routingCallback || this.options.routingCallback;

    var startMarker = this._getNode(route._startMarkerId);

    var endMarker = this._getNode(route._endMarkerId);

    route.removeFrom(this._getEdgeContainer(route));

    this._prepareNode(node, this._getNodeContainer(startMarker));

    var edge1 = this._createEdge(startMarker, node);

    var edge2 = this._createEdge(node, endMarker);

    this._fireStart();

    edge1._computation += 1;
    edge2._computation += 1;
    var currentComputation1 = edge1._computation;
    var currentComputation2 = edge2._computation;
    var promise1 = new Promise(function (resolve, reject) {
      callback.call(null, startMarker, node, function (err, route1) {
        var metadata1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (err !== null) {
          reject(err);
          return;
        }

        if (edge1._computation === currentComputation1) {
          startMarker.setLatLng(L.latLng(route1[0]));
          node.setLatLng(L.latLng(route1[route1.length - 1]));
          edge1.setLatLngs(route1);
          edge1.options.metadata = JSON.parse(JSON.stringify(metadata1));
          edge1.setStyle({
            dashArray: null
          });
        }

        resolve({
          from: startMarker,
          to: node,
          edge: edge1
        });
      });
    });
    var promise2 = new Promise(function (resolve, reject) {
      callback.call(null, node, endMarker, function (err, route2) {
        var metadata2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (err !== null) {
          reject(err);
          return;
        }

        if (edge2._computation === currentComputation2) {
          node.setLatLng(L.latLng(route2[0]));
          endMarker.setLatLng(L.latLng(route2[route2.length - 1]));
          edge2.setLatLngs(route2);
          edge2.options.metadata = JSON.parse(JSON.stringify(metadata2));
          edge2.setStyle({
            dashArray: null
          });
        }

        resolve({
          from: node,
          to: endMarker,
          edge: edge2
        });
      });
    });
    return Promise.all([promise1, promise2]).then(function (routes) {
      _this12._fireDone({
        routes: routes
      });
    })["catch"](function (e) {
      _this12._fireFailed(e);
    });
  },
  _onDragStartNode: function _onDragStartNode(marker) {
    var _this$_getPrevious2 = this._getPrevious(marker),
        previousEdge = _this$_getPrevious2.previousEdge;

    var _this$_getNext = this._getNext(marker),
        nextEdge = _this$_getNext.nextEdge;

    if (previousEdge !== undefined) {
      previousEdge.setStyle({
        dashArray: '4'
      });
    }

    if (nextEdge !== undefined) {
      nextEdge.setStyle({
        dashArray: '4'
      });
    }

    return this;
  },
  _onDragNode: function _onDragNode(marker) {
    var _this$_getPrevious3 = this._getPrevious(marker),
        previousEdge = _this$_getPrevious3.previousEdge,
        previousNode = _this$_getPrevious3.previousNode;

    var _this$_getNext2 = this._getNext(marker),
        nextEdge = _this$_getNext2.nextEdge,
        nextNode = _this$_getNext2.nextNode;

    if (previousEdge !== undefined) {
      previousEdge.setLatLngs([previousNode.getLatLng(), marker.getLatLng()]);
    }

    if (nextEdge !== undefined) {
      nextEdge.setLatLngs([nextNode.getLatLng(), marker.getLatLng()]);
    }

    return this;
  },
  onMoveNode: function onMoveNode(marker, routingCallback) {
    var _this13 = this;

    var callback = routingCallback || this.options.routingCallback;
    var promises = [];

    var _this$_getPrevious4 = this._getPrevious(marker),
        previousEdge = _this$_getPrevious4.previousEdge,
        previousNode = _this$_getPrevious4.previousNode;

    var _this$_getNext3 = this._getNext(marker),
        nextEdge = _this$_getNext3.nextEdge,
        nextNode = _this$_getNext3.nextNode;

    this._fireStart();

    this._onDragStartNode(marker);

    this._onDragNode(marker);

    if (previousEdge !== undefined) {
      previousEdge._computation += 1;
      var currentComputation = previousEdge._computation;
      promises.push(new Promise(function (resolve, reject) {
        callback.call(null, previousNode, marker, function (err, route) {
          var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          if (err !== null) {
            reject(err);
            return;
          }

          if (previousEdge._computation === currentComputation) {
            marker.setLatLng(L.latLng(route[route.length - 1]));
            previousEdge.setLatLngs(route);
            previousEdge.options.metadata = JSON.parse(JSON.stringify(metadata));
            previousEdge.setStyle({
              dashArray: null
            });
          }

          resolve({
            from: previousNode,
            to: marker,
            edge: previousEdge
          });
        });
      }));
    }

    if (nextEdge !== undefined) {
      nextEdge._computation += 1;
      var _currentComputation = nextEdge._computation;
      promises.push(new Promise(function (resolve, reject) {
        callback.call(null, marker, nextNode, function (err, route) {
          var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          if (err !== null) {
            reject(err);
            return;
          }

          if (nextEdge._computation === _currentComputation) {
            marker.setLatLng(L.latLng(route[0]));
            nextEdge.setLatLngs(route);
            nextEdge.options.metadata = JSON.parse(JSON.stringify(metadata));
            nextEdge.setStyle({
              dashArray: null
            });
          }

          resolve({
            from: marker,
            to: nextNode,
            edge: nextEdge
          });
        });
      }));
    }

    return Promise.all(promises).then(function (routes) {
      _this13._fireDone({
        routes: routes
      });
    })["catch"](function (e) {
      _this13._fireFailed(e);
    });
  },
  removeNode: function removeNode(node, routingCallback) {
    var _this14 = this;

    var callback = routingCallback || this.options.routingCallback;
    var promises = [];

    this._fireStart();

    var oldValue = this._fireEvents;
    this._fireEvents = false;
    this.demoteNodeToWaypoint(node);
    this._fireEvents = oldValue;

    var nodeContainer = this._getNodeContainer(node);

    var _this$_getPrevious5 = this._getPrevious(node),
        previousEdge = _this$_getPrevious5.previousEdge,
        previousNode = _this$_getPrevious5.previousNode;

    var _this$_getNext4 = this._getNext(node),
        nextEdge = _this$_getNext4.nextEdge,
        nextNode = _this$_getNext4.nextNode;

    if (previousEdge !== undefined && nextEdge !== undefined) {
      // Intermediate marker
      nextNode._routeIdPrevious = node._routeIdPrevious;
      previousEdge._endMarkerId = nextEdge._endMarkerId;
      nextEdge.removeFrom(this._getEdgeContainer(nextEdge));
      node.removeFrom(nodeContainer);
      previousEdge.setLatLngs([previousNode.getLatLng(), nextNode.getLatLng()]).setStyle({
        dashArray: '4'
      });
      previousEdge._computation += 1;
      var currentComputation = previousEdge._computation;
      promises.push(new Promise(function (resolve, reject) {
        callback.call(null, previousNode, nextNode, function (err, route) {
          var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          if (err !== null) {
            reject(err);
            return;
          }

          if (previousEdge._computation === currentComputation) {
            previousEdge.setLatLngs(route).setStyle({
              dashArray: null
            });
            previousEdge.options.metadata = JSON.parse(JSON.stringify(metadata));
          }

          resolve({
            from: previousNode,
            to: nextNode,
            edge: previousEdge
          });
        });
      }));
    } else if (previousEdge !== undefined) {
      // Last marker of path
      previousNode._routeIdNext = undefined;
      this._lastNodeId = previousEdge._startMarkerId;
      previousEdge.removeFrom(this._getEdgeContainer(previousEdge));
      node.removeFrom(nodeContainer);
    } else if (nextEdge !== undefined) {
      // First marker of path
      nextNode._routeIdPrevious = undefined;
      this._firstNodeId = nextEdge._endMarkerId;
      nextEdge.removeFrom(this._getEdgeContainer(nextEdge));
      node.removeFrom(nodeContainer);
    } else {
      // Lonely marker
      this._lastNodeId = undefined;
      this._firstNodeId = undefined;
      node.removeFrom(nodeContainer);
    }

    return Promise.all(promises).then(function (routes) {
      _this14._fireDone({
        routes: routes
      });
    })["catch"](function (e) {
      _this14._fireFailed(e);
    });
  },
  promoteNodeToStopover: function promoteNodeToStopover(node) {
    var _this15 = this;

    if (node._promoted) {
      return this;
    }

    if (this._getNodeId(node) === this._firstNodeId) {
      node.setType('stopover');
      node._promoted = true;
      node._demoted = false;
      return this;
    }

    this._fireStart();

    var index = this._getNodeContainerIndex(node);

    var nodes = [];
    var edges = [];
    var currentNode = node;

    do {
      nodes.push(currentNode);

      var _this$_getNext5 = this._getNext(currentNode),
          nextEdge = _this$_getNext5.nextEdge,
          nextNode = _this$_getNext5.nextNode;

      if (nextEdge === undefined) {
        break;
      }

      nodes.push(currentNode);
      edges.push(nextEdge);
      currentNode = nextNode;
    } while (currentNode.options.type !== 'stopover');

    var newNodesContainer = L.featureGroup();
    var newEdgesContainer = L.featureGroup();

    this._nodesContainers.splice(index + 1, 0, newNodesContainer);

    this._edgesContainers.splice(index + 1, 0, newEdgesContainer);

    this._currentColorIndex += 1;
    nodes.forEach(function (e) {
      e.removeFrom(_this15._getNodeContainer(e)).addTo(newNodesContainer);
    });
    edges.forEach(function (e) {
      e.removeFrom(_this15._getEdgeContainer(e)).addTo(newEdgesContainer);
    });
    newNodesContainer.setStyle({
      colorName: Colors.nameOf(this._currentColorIndex)
    });
    newEdgesContainer.setStyle({
      color: Colors.rgbOf(this._currentColorIndex)
    });
    node.setType('stopover');
    node._promoted = true;
    node._demoted = false;

    this._fireDone();

    return this;
  },
  demoteNodeToWaypoint: function demoteNodeToWaypoint(node) {
    var _this16 = this;

    if (node._demoted) {
      return this;
    }

    var index = this._getNodeContainerIndex(node);

    if (index === 0) {
      return this;
    }

    this._fireStart();

    var nodes = [];
    var edges = [];
    var currentNode = node;

    do {
      nodes.push(currentNode);

      var _this$_getNext6 = this._getNext(currentNode),
          nextEdge = _this$_getNext6.nextEdge,
          nextNode = _this$_getNext6.nextNode;

      if (nextEdge === undefined) {
        break;
      }

      nodes.push(currentNode);
      edges.push(nextEdge);
      currentNode = nextNode;
    } while (currentNode.options.type !== 'stopover');

    var previousNodesContainer = this._nodesContainers.get(index - 1);

    var previousEdgesContainer = this._edgesContainers.get(index - 1);

    this._nodesContainers.splice(index, 1);

    this._edgesContainers.splice(index, 1);

    nodes.forEach(function (e) {
      e.removeFrom(_this16._getNodeContainer(e)).addTo(previousNodesContainer);
    });
    edges.forEach(function (e) {
      e.removeFrom(_this16._getEdgeContainer(e)).addTo(previousEdgesContainer);
    });

    var _this$_getPrevious6 = this._getPrevious(nodes[0]),
        previousEdge = _this$_getPrevious6.previousEdge,
        previousNode = _this$_getPrevious6.previousNode;

    if (previousEdge !== undefined) {
      previousNodesContainer.setStyle({
        colorName: previousNode.options.colorName
      });
      previousEdgesContainer.setStyle({
        color: previousEdge.options.color
      });
    }

    node.setType('waypoint');
    node._promoted = false;
    node._demoted = true;

    this._fireDone();

    return this;
  }
});
module.exports = {
  Track: Track,
  track: function track(options) {
    return new Track(options);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Colors":6,"./Edge":7,"./LayerContainer":9,"@babel/runtime/helpers/asyncToGenerator":1,"@babel/runtime/helpers/interopRequireDefault":2,"@babel/runtime/regenerator":3}],15:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var _require = _dereq_('./Track'),
    Track = _require.Track,
    track = _require.track;

var _require2 = _dereq_('./ToolBar'),
    ToolBar = _require2.ToolBar,
    toolBar = _require2.toolBar;

var _require3 = _dereq_('./TraceModeBar'),
    TraceModeBar = _require3.TraceModeBar,
    traceModeBar = _require3.traceModeBar;

var LayerContainer = _dereq_('./LayerContainer');

var _require4 = _dereq_('./Node'),
    Node = _require4.Node,
    node = _require4.node;

var _require5 = _dereq_('./Edge'),
    Edge = _require5.Edge,
    edge = _require5.edge;

var colors = _dereq_('./Colors');

_dereq_('./Loader');

var latlngutils = _dereq_('./LatLngUtils');
/** @module L.TrackDrawer */


L.TrackDrawer = {
  Track: Track,
  track: track,
  ToolBar: ToolBar,
  toolBar: toolBar,
  TraceModeBar: TraceModeBar,
  traceModeBar: traceModeBar,
  LayerContainer: LayerContainer,
  Node: Node,
  node: node,
  Edge: Edge,
  edge: edge,
  colors: colors,
  latlngutils: latlngutils
};
module.exports = L.TrackDrawer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Colors":6,"./Edge":7,"./LatLngUtils":8,"./LayerContainer":9,"./Loader":10,"./Node":11,"./ToolBar":12,"./TraceModeBar":13,"./Track":14}]},{},[15]);
