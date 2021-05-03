"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param fn_name
 * @param args
 * @param expected
 */
function checkNumArgs(fn_name, args, max, min) {
    if (min === undefined) {
        if (args.length !== (max + 1)) {
            throw new Error('Inline function "' + fn_name + '()": wrong number of arguments. ' +
                'The required number of arguments is ' + max + '. ' +
                'but ' + (args.length - 1) + ' arguments were given.' +
                'Please check the documentation for the "' + fn_name + '()" function.');
        }
    }
    else {
        if (args.length > max + 1) {
            throw new Error('Inline function "' + fn_name + '()": too many arguments. ' +
                'The maximum number of arguments is ' + max + '. ' +
                'but ' + (args.length - 1) + ' arguments were given.' +
                'Please check the documentation for the "' + fn_name + '()" function.');
        }
        if (args.length < min + 1) {
            throw new Error('Inline function "' + fn_name + '()": too few arguments. ' +
                'The minimum number of arguments is ' + max + '. ' +
                'but ' + (args.length - 1) + ' arguments were given. ' +
                'Please check the documentation for the "' + fn_name + '()" function.');
        }
    }
}
exports.checkNumArgs = checkNumArgs;
/**
 *
 * @param fn_name
 * @param args
 */
function checkListsSameLen(fn_name, args) {
    for (let i = 1; i < args.length; i++) {
        if (!Array.isArray(args[i])) {
            throw new Error('Inline function "' + fn_name + '()": invalid arguments. ' +
                'The arguments must all be lists. ' +
                'The following argument is not a list: ' + JSON.stringify(args[i]) +
                'Please check the documentation for the "' + fn_name + '()" function.');
        }
        if (i > 1) {
            if (args[1].length !== args[i].length) {
                throw new Error('Inline function "' + fn_name + '()": invalid arguments. ' +
                    'The arguments must all be lists of the same length. ' +
                    'The following argument has a length that does not match the first list: ' + JSON.stringify(args[i]) +
                    'Please check the documentation for the "' + fn_name + '()" function.');
            }
        }
    }
}
exports.checkListsSameLen = checkListsSameLen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NoZWNrX2lubGluZV9hcmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvc3JjL2NvcmUvX2NoZWNrX2lubGluZV9hcmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7Ozs7O0dBS0c7QUFDSCxTQUFnQixZQUFZLENBQUMsT0FBZSxFQUFFLElBQWdCLEVBQUUsR0FBVyxFQUFFLEdBQVk7SUFDckYsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFHO1FBQ3BCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUMzQixNQUFNLElBQUksS0FBSyxDQUNYLG1CQUFtQixHQUFHLE9BQU8sR0FBRyxrQ0FBa0M7Z0JBQ2xFLHNDQUFzQyxHQUFHLEdBQUcsR0FBRyxJQUFJO2dCQUNuRCxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLHdCQUF3QjtnQkFDckQsMENBQTBDLEdBQUcsT0FBTyxHQUFHLGVBQWUsQ0FDekUsQ0FBQztTQUNMO0tBQ0o7U0FBTTtRQUNILElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ1gsbUJBQW1CLEdBQUcsT0FBTyxHQUFHLDJCQUEyQjtnQkFDM0QscUNBQXFDLEdBQUcsR0FBRyxHQUFHLElBQUk7Z0JBQ2xELE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsd0JBQXdCO2dCQUNyRCwwQ0FBMEMsR0FBRyxPQUFPLEdBQUcsZUFBZSxDQUN6RSxDQUFDO1NBQ0w7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRTtZQUN2QixNQUFNLElBQUksS0FBSyxDQUNYLG1CQUFtQixHQUFHLE9BQU8sR0FBRywwQkFBMEI7Z0JBQzFELHFDQUFxQyxHQUFHLEdBQUcsR0FBRyxJQUFJO2dCQUNsRCxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLHlCQUF5QjtnQkFDdEQsMENBQTBDLEdBQUcsT0FBTyxHQUFHLGVBQWUsQ0FDekUsQ0FBQztTQUNMO0tBQ0o7QUFDTCxDQUFDO0FBNUJELG9DQTRCQztBQUNEOzs7O0dBSUc7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxPQUFlLEVBQUUsSUFBZ0I7SUFDL0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FDWCxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsMEJBQTBCO2dCQUMxRCxtQ0FBbUM7Z0JBQ25DLHdDQUF3QyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSwwQ0FBMEMsR0FBRyxPQUFPLEdBQUcsZUFBZSxDQUN6RSxDQUFDO1NBQ0w7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDUCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDbkMsTUFBTSxJQUFJLEtBQUssQ0FDWCxtQkFBbUIsR0FBRyxPQUFPLEdBQUcsMEJBQTBCO29CQUMxRCxzREFBc0Q7b0JBQ3RELDBFQUEwRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwRywwQ0FBMEMsR0FBRyxPQUFPLEdBQUcsZUFBZSxDQUN6RSxDQUFDO2FBQ0w7U0FDSjtLQUNKO0FBQ0wsQ0FBQztBQXJCRCw4Q0FxQkMifQ==