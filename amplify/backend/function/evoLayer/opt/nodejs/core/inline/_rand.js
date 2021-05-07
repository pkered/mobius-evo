"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mathjs = __importStar(require("mathjs"));
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Returns a random number in the specified range
 * Returns a random number in the specified range, given a numeric seed
 * @param min
 * @param max
 * @param seed
 */
function rand(debug, min, max, seed) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('rand', arguments, 3, 2);
    }
    if (seed !== undefined) {
        return min + (_randWithSeed(seed) * (max - min));
    }
    else {
        return mathjs.random(min, max);
    }
}
exports.rand = rand;
/**
 * Returns a random integer in the specified range
 * Returns a random integer in the specified range, given a numeric seed
 * @param min
 * @param max
 * @param seed
 */
function randInt(debug, min, max, seed) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('randInt', arguments, 3, 2);
    }
    if (seed !== undefined) {
        return Math.floor(min + (_randWithSeed(seed) * (max - min)));
    }
    else {
        return mathjs.randomInt(min, max);
    }
}
exports.randInt = randInt;
/**
 * Returns a random set of items from the list
 * Returns a random set of items from the list, given a numeric seed
 * @param list
 * @param num
 * @param seed
 */
function randPick(debug, list, num, seed) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('randPick', arguments, 3, 2);
    }
    if (num === 1) {
        const length = list.length;
        if (seed !== undefined) {
            return list[Math.floor(_randWithSeed(seed) * length)];
        }
        else {
            return list[mathjs.randomInt(0, list.length)];
        }
    }
    const list_copy = list.slice();
    _randShuffleWithSeed(list_copy, seed);
    return list_copy.slice(0, num);
}
exports.randPick = randPick;
// TODO is there a better random function than this?
function _randWithSeed(s) {
    // const x = (Math.sin(s) + Math.sin(s * Math.E / 2) + Math.sin((s + 1) * (Math.PI / 3))) * 10000;
    // return x - Math.floor(x);
    // return (Math.sin(s / 2 + 1) + Math.cos(s + 2) * 5) * 10000 % 1;
    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    /* tslint:disable */
    var x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
    //return (2**31-1&(s=Math.imul(48271,s)))/2**31;
    /* tslint:enable */
}
function _randShuffleWithSeed(arr, seed) {
    let ctr = arr.length;
    while (ctr > 0) {
        const r = (seed === undefined) ? Math.random() : _randWithSeed(ctr + seed);
        const index = Math.floor(r * ctr);
        ctr--;
        const temp = arr[ctr];
        arr[ctr] = arr[index];
        arr[index] = temp;
    }
    return arr;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3JhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvaW5saW5lL19yYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLCtDQUFpQztBQUNqQyw4REFBcUQ7QUFDckQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsSUFBSSxDQUFDLEtBQWMsRUFBRSxHQUFXLEVBQUUsR0FBVyxFQUFFLElBQWE7SUFDeEUsSUFBSSxLQUFLLEVBQUU7UUFDUCxpQ0FBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3pDO0lBQ0QsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3BCLE9BQU8sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDcEQ7U0FBTTtRQUNILE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDbEM7QUFDTCxDQUFDO0FBVEQsb0JBU0M7QUFDRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixPQUFPLENBQUMsS0FBYyxFQUFFLEdBQVcsRUFBRSxHQUFXLEVBQUUsSUFBYTtJQUMzRSxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUM7SUFDRCxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7UUFDcEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEU7U0FBTTtRQUNILE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDckM7QUFDTCxDQUFDO0FBVEQsMEJBU0M7QUFDRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixRQUFRLENBQUMsS0FBYyxFQUFFLElBQVcsRUFBRSxHQUFXLEVBQUUsSUFBYTtJQUM1RSxJQUFJLEtBQUssRUFBRTtRQUNQLGlDQUFZLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDN0M7SUFDRCxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7UUFDWCxNQUFNLE1BQU0sR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ25DLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNwQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ3pEO2FBQU07WUFDSCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUNqRDtLQUNKO0lBQ0QsTUFBTSxTQUFTLEdBQVUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3RDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFmRCw0QkFlQztBQUNELG9EQUFvRDtBQUNwRCxTQUFTLGFBQWEsQ0FBQyxDQUFTO0lBQzVCLGtHQUFrRztJQUNsRyw0QkFBNEI7SUFFNUIsa0VBQWtFO0lBQ2xFLCtGQUErRjtJQUMvRixvQkFBb0I7SUFDcEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUM5QixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLGdEQUFnRDtJQUNoRCxtQkFBbUI7QUFDdkIsQ0FBQztBQUNELFNBQVMsb0JBQW9CLENBQUMsR0FBVSxFQUFFLElBQWE7SUFDbkQsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUNyQixPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDWixNQUFNLENBQUMsR0FBVyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ25GLE1BQU0sS0FBSyxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLEdBQUcsRUFBRSxDQUFDO1FBQ04sTUFBTSxJQUFJLEdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEIsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztLQUNyQjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyJ9