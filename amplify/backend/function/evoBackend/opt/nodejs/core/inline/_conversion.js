"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _check_inline_args_1 = require("../_check_inline_args");
/**
 * Converts radians to degrees.
 *
 * @param rad
 */
function radToDeg(debug, rad) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('radToDeg', arguments, 1);
    }
    if (Array.isArray(rad)) {
        return rad.map(a_rad => radToDeg(debug, a_rad));
    }
    return rad * (180 / Math.PI);
}
exports.radToDeg = radToDeg;
/**
 * Converts degrees to radians.
 *
 * @param deg
 */
function degToRad(debug, deg) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('degToRad', arguments, 1);
    }
    if (Array.isArray(deg)) {
        return deg.map(a_deg => degToRad(debug, a_deg));
    }
    return deg * (Math.PI / 180);
}
exports.degToRad = degToRad;
/**
 * Converts the number to a string, with commas, e.g. 1,234,567
 * Converts the number to a string, with commas, where "d" specifies the number of fraction digits, e.g. 1,234.00.
 * Converts the number to a string, where "d" specifies the number of fraction digits, and "l" specifies the locale, e.g. "en-GB", "fi-FI", "in-IN", "pt-BR", etc'
 *
 * @param num
 * @param frac_digits
 * @param locale
 */
function numToStr(debug, num, frac_digits, locale) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('numToStr', arguments, 3, 1);
    }
    if (Array.isArray(num)) {
        for (let i = 0; i < num.length; i++) {
            num[i] = typeof num === 'number' ? num : Number(num);
        }
    }
    else {
        num = typeof num === 'number' ? num : Number(num);
    }
    const options = {};
    if (frac_digits !== undefined) {
        options['maximumFractionDigits'] = frac_digits;
        options['minimumFractionDigits'] = frac_digits;
    }
    locale = locale === undefined ? 'en-GB' : locale;
    if (Array.isArray(num)) {
        return num.map(a_num => a_num.toLocaleString(locale, options));
    }
    return num.toLocaleString(locale, options);
}
exports.numToStr = numToStr;
/**
 * Converts the number to a string representing currency.
 *
 * @param num
 * @param currency
 * @param locale
 */
function numToCurr(debug, num, currency, locale) {
    if (debug) {
        _check_inline_args_1.checkNumArgs('numToCurr', arguments, 3, 2);
    }
    if (Array.isArray(num)) {
        for (let i = 0; i < num.length; i++) {
            num[i] = typeof num === 'number' ? num : Number(num);
        }
    }
    else {
        num = typeof num === 'number' ? num : Number(num);
    }
    const options = {};
    options['style'] = 'currency';
    options['currency'] = currency;
    locale = locale === undefined ? 'en-GB' : locale;
    if (Array.isArray(num)) {
        return num.map(a_num => a_num.toLocaleString(locale, options));
    }
    return num.toLocaleString(locale, options);
}
exports.numToCurr = numToCurr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NvbnZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2NvcmUvaW5saW5lL19jb252ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOERBQXFEO0FBRXJEOzs7O0dBSUc7QUFDSCxTQUFnQixRQUFRLENBQUMsS0FBYyxFQUFFLEdBQW9CO0lBQ3pELElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBYSxDQUFDO0tBQUU7SUFDeEYsT0FBTyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFORCw0QkFNQztBQUNEOzs7O0dBSUc7QUFDSCxTQUFnQixRQUFRLENBQUMsS0FBYyxFQUFFLEdBQW9CO0lBQ3pELElBQUksS0FBSyxFQUFFO1FBQ1AsaUNBQVksQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzFDO0lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBYSxDQUFDO0tBQUU7SUFDeEYsT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFORCw0QkFNQztBQUNEOzs7Ozs7OztH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