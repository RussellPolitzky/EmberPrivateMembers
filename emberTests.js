
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
});
