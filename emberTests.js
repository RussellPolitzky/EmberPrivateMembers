
// ----------------------------------------------------
// Ember Tests
// ----------------------------------------------------
$(document).ready(function () {

    module("Ember Tests", {
        setup: function () {
        },
        teardown: function () {
        }
    });

    test("should be able to create private statics for ember class", function () {
        // ReSharper disable InconsistentNaming
        var Class = Ember.Object.extend(
        // ReSharper restore InconsistentNaming
            (function () {
                // Static var common to all instances (by defn.)
                var aStaticMemberVariable = 10;

                return {
                    staticValueExposeOnInstance: function (key, value) {
                        // getter
                        if (arguments.length === 1) {
                            return aStaticMemberVariable;
                            // setter
                        } else {
                            aStaticMemberVariable = 20;
                            return value;
                        }
                    } .property()
                };
            })()
        );

        var instance1 = new Class();
        var initialValueFromInstance = instance1.get('staticValueExposeOnInstance');
        ok(initialValueFromInstance === 10, 'Expected to see 10 from property on instance 1 but got ' + initialValueFromInstance);

        // now change the value via instance 1.
        instance1.set('staticValueExposeOnInstance', 20);

        // create a new instance and ensure that we have the new value ...
        var instance2 = new Class();
        var valueFromInstance2 = instance2.get('staticValueExposeOnInstance');
        ok(valueFromInstance2 === 20, 'Expected 20 from instance 2 but got ' + valueFromInstance2);
    });



    test("should be able to create private instance members for ember objects", function () {

        // ReSharper disable InconsistentNaming
        var Class = Ember.Object.extend(
        // ReSharper restore InconsistentNaming
            (function () {

                var aStaticMemberVariable = 10; // Static var common to all instances (by defn.)

                return {
                    functionThatUsesPrivateInstanceState: undefined,
                    secondFunctionUsesPrivateInstanceState: undefined,
                    mutatePrivateState: undefined,

                    init: function () {

                        var privateInstanceVariable = 10; // Private instance var ...

                        // Notice how the instance methods are assigned here
                        // in the ctor.  This allows us to use the closure 
                        // defined by the scope of this function.  

                        // The closure formed by this function allows it
                        // to acces the private state defined here even 
                        // though its assigned to functionThatUsesPrivateInstanceState.
                        this.functionThatUsesPrivateInstanceState = function () {
                            return privateInstanceVariable;
                        };

                        // The closure formed by this function allows it
                        // to acces the private state defined here even 
                        // though its assigned to secondFunctionUsesPrivateInstanceState.
                        this.secondFunctionUsesPrivateInstanceState = function () {
                            return privateInstanceVariable + 10;
                        };

                        // The closure formed by this function allows it
                        // to acces the private state defined here even 
                        // though its assigned to mutatePrivateState.
                        this.mutatePrivateState = function (newValue) {
                            privateInstanceVariable = newValue;
                        };

                        this._super();
                    },

                    staticValueExposeOnInstance: function (key, value) {
                        // getter
                        if (arguments.length === 1) {
                            return aStaticMemberVariable;
                            // setter
                        } else {
                            aStaticMemberVariable = 20;
                            return value;
                        }
                    } .property()
                };
            })()
        );

        // Instance 1 tests
        var instance1 = new Class();
        var instance1InitialValue = instance1.functionThatUsesPrivateInstanceState();
        equal(instance1InitialValue, 10, 'Expected initial value to be 10 but was ' + instance1InitialValue);

        instance1.mutatePrivateState(20);
        var instance1ValueAfterSetting = instance1.functionThatUsesPrivateInstanceState();
        equal(instance1ValueAfterSetting, 20, 'Expected initial value to be 20 but was ' + instance1InitialValue);

        var instance1ValueAfterSetting2 = instance1.secondFunctionUsesPrivateInstanceState();
        equal(instance1ValueAfterSetting2, 20+10, 'Expected initial value to be 20 but was ' + instance1InitialValue);

        // Instance 2 tests
        var instance2 = new Class();
        var instance2InitialValue = instance2.functionThatUsesPrivateInstanceState();
        equal(instance2InitialValue, 10, 'Expected initial value to be 10 but was ' + instance2InitialValue);

        var instance2InitialValue2 = instance2.secondFunctionUsesPrivateInstanceState();
        equal(instance2InitialValue2, 10+10, 'Expected initial value to be 10 but was ' + instance2InitialValue2);

        instance2.mutatePrivateState(99);
        var instance2InitialValue2 = instance2.functionThatUsesPrivateInstanceState();
        equal(instance2InitialValue2, 99, 'Expected initial value to be 30 but was ' + instance2InitialValue2);
    });


    // This test shows how to create private state for Ember Mixins.
    // Ordinarily, it is assumed that Ember Mixins consist of stateless,
    // public functions and that there's no shared private state
    // between them.  This limitation can be overcome by building
    // a mixin contructor as shown below.  The constructor is based
    // on an immediate function which returns an initializer object
    // for the mixin.  The initializer object uses a closure to 
    // access private state.  A factory function creates a new mixin 
    // for every call to achieve private instance state.
    //
    // In addition is is possibe to create private static state 
    // for mixins.  This is achieved by using a second, immediate
    // function which is only executed once.
    test('should be able to create private instance methods in an Ember mixin', function () {
        var messageForPrivateStaticFunction = 'I am a privateStaticFunction';

        var mixinConstructor = (function () { // This immediate function creates the static state.
            var privateStaticState = 10;
            var privateStaticFunction = function () { return messageForPrivateStaticFunction; };

            return function (mixinConstructorParameter) {

                return Ember.Mixin.create(
                // In a standard mixin, this is only executed once.
                // which is why we need a factory function to build 
                // a new one for each instance of the mixin.
                    (function () {
                        var privateFunction = function () {
                        };
                        var privateState = mixinConstructorParameter;
                        return {
                            privateFunction: function () { return privateFunction; }, // Working with private functions.
                            privateState: privateState,  // Working with private state.
                            propertyBasedOnStaticState: function (key, value) { // Note that we need to use computed property here.
                                if (arguments.length === 1) { // getter
                                    return privateStaticState;
                                } else { // setter
                                    privateStaticState = value;
                                    return value;
                                }
                            } .property(),
                            usesPrivateStaticFunction: function () { // Uses private static function
                                return privateStaticFunction();
                            }
                        };
                    })());
            };
        })();
        
        var parmater1 = 1;
        var parmater2 = 2;

        // Note that we use the mixin constructor to build a new instance with its own private state.
        var emberObjectA = Ember.Object.create(mixinConstructor(parmater1), {});
        var emberObjectB = Ember.Object.create(mixinConstructor(parmater2), {});

        var privateFunctionA = emberObjectA.get('privateFunction');
        var privateFunctionB = emberObjectB.get('privateFunction');

        ok(!(privateFunctionA === privateFunctionB), 'Expected that separate private instance members were created.');

        var privateStateA = emberObjectA.get('privateState');
        var privateStateB = emberObjectB.get('privateState');

        ok(privateStateA === parmater1, 'Expected to get separate and private state from each mixin.');
        ok(privateStateB === parmater2, 'Expected to get separate and private state from each mixin.');

        // Test private statics in the mixin.
        var valueOfStaticState = emberObjectA.get('propertyBasedOnStaticState');
        emberObjectA.set('propertyBasedOnStaticState', 12);

        var newValueOfStaticStateA = emberObjectA.get('propertyBasedOnStaticState');
        var newValueOfStaticStateB = emberObjectB.get('propertyBasedOnStaticState');
        equal(newValueOfStaticStateA, newValueOfStaticStateB, 'Expected static state to be the same from all objects.');

        var resultFromPrivateStaticFunctionOnA = emberObjectA.usesPrivateStaticFunction();
        var resultFromPrivateStaticFunctionOnB = emberObjectB.usesPrivateStaticFunction();

        equal(resultFromPrivateStaticFunctionOnA, messageForPrivateStaticFunction, 'Expected correct message from private static function.');
        equal(resultFromPrivateStaticFunctionOnB, messageForPrivateStaticFunction, 'Expected correct message from private static function.');
    });
    
});
