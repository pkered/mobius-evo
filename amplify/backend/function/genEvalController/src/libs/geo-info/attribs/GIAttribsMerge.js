"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const lodash = __importStar(require("lodash"));
/**
 * Class for mering attributes.
 */
class GIAttribsMerge {
    /**
      * Creates an object...
      * @param modeldata The JSON data
      */
    constructor(modeldata) {
        this.modeldata = modeldata;
    }
    /**
     * Adds data to this model from another model.
     * The existing data in the model is not deleted - checks for conflicts.
     * @param model_data Attribute data from the other model.
     */
    merge(ssid, exist_ssid) {
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.POSI);
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.VERT);
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.EDGE);
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.WIRE);
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.POINT);
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.PLINE);
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.PGON);
        this._mergeEntAttribs(ssid, exist_ssid, common_1.EEntType.COLL);
        this._mergeModelAttribs(ssid, exist_ssid);
    }
    /**
     * Adds data to this model from another model.
     * The existing data in the model is not deleted - checks for conflicts.
     * @param model_data Attribute data from the other model.
     */
    add(ssid, exist_ssid) {
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.POSI);
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.VERT);
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.EDGE);
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.WIRE);
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.POINT);
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.PLINE);
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.PGON);
        this._addEntAttribs(ssid, exist_ssid, common_1.EEntType.COLL);
        this._mergeModelAttribs(ssid, exist_ssid);
    }
    // ============================================================================
    // Private methods
    // ============================================================================
    /**
     * From another model
     * The existing attributes are not deleted
     * Deep copy of attrib values
     * @param attribs_maps
     */
    _mergeModelAttribs(ssid, exist_ssid) {
        const other_attribs = this.modeldata.attribs.attribs_maps.get(exist_ssid)[common_1.EEntTypeStr[common_1.EEntType.MOD]];
        const this_attribs = this.modeldata.attribs.attribs_maps.get(ssid)[common_1.EEntTypeStr[common_1.EEntType.MOD]];
        // TODO this is a hack to fix an error
        if (!(other_attribs instanceof Map)) {
            return;
        }
        // end of hack
        other_attribs.forEach((val, key) => {
            this_attribs.set(key, lodash.cloneDeep(val));
        });
    }
    /**
     * Merge attributes from another attribute map into this attribute map.
     * Conflict detection is performed.
     */
    _mergeEntAttribs(ssid, other_ssid, ent_type) {
        const other_attribs = this.modeldata.attribs.attribs_maps.get(other_ssid)[common_1.EEntTypeStr[ent_type]];
        const this_attribs = this.modeldata.attribs.attribs_maps.get(ssid)[common_1.EEntTypeStr[ent_type]];
        other_attribs.forEach(other_attrib => {
            const other_ents_i = this.modeldata.geom.snapshot.filterEnts(other_ssid, ent_type, other_attrib.getEnts());
            if (other_ents_i.length > 0) {
                // get the name
                const name = other_attrib.getName();
                // get or create the attrib
                let this_attrib;
                if (!this_attribs.has(name)) {
                    this_attrib = this.modeldata.attribs.add.addEntAttrib(ent_type, name, other_attrib.getDataType());
                }
                else {
                    this_attrib = this_attribs.get(name);
                    if (this_attrib.getDataType() !== other_attrib.getDataType()) {
                        throw new Error('Merge Error: Cannot merge attributes with different data types.');
                    }
                }
                // merge
                this_attrib.mergeAttribMap(other_attrib, other_ents_i);
            }
        });
    }
    /**
     * Add attributes from another attribute map into this attribute map.
     * No conflict detection is performed.
     * This attribute map is assumed to be empty.
     * @param ssid
     * @param other_ssid
     * @param ent_type
     */
    _addEntAttribs(ssid, other_ssid, ent_type) {
        const other_attribs = this.modeldata.attribs.attribs_maps.get(other_ssid)[common_1.EEntTypeStr[ent_type]];
        other_attribs.forEach(other_attrib => {
            const other_ents_i = this.modeldata.geom.snapshot.filterEnts(other_ssid, ent_type, other_attrib.getEnts());
            if (other_ents_i.length > 0) {
                // get the name
                const name = other_attrib.getName();
                // get or create the attrib
                const this_attrib = this.modeldata.attribs.add.addEntAttrib(ent_type, name, other_attrib.getDataType());
                // merge
                this_attrib.addAttribMap(other_attrib, other_ents_i);
            }
        });
    }
}
exports.GIAttribsMerge = GIAttribsMerge;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lBdHRyaWJzTWVyZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90cy9zcmMvbGlicy9nZW8taW5mby9hdHRyaWJzL0dJQXR0cmlic01lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHNDQUN3RTtBQUV4RSwrQ0FBaUM7QUFJakM7O0dBRUc7QUFDSCxNQUFhLGNBQWM7SUFFeEI7OztRQUdJO0lBQ0gsWUFBWSxTQUFzQjtRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxJQUFZLEVBQUUsVUFBa0I7UUFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGlCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLGlCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNEOzs7O09BSUc7SUFDSSxHQUFHLENBQUMsSUFBWSxFQUFFLFVBQWtCO1FBQ3ZDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNELCtFQUErRTtJQUMvRSxrQkFBa0I7SUFDbEIsK0VBQStFO0lBQy9FOzs7OztPQUtHO0lBQ0ssa0JBQWtCLENBQUMsSUFBWSxFQUFFLFVBQWtCO1FBQ3ZELE1BQU0sYUFBYSxHQUFrQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFXLENBQUUsaUJBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDO1FBQ3RJLE1BQU0sWUFBWSxHQUFrQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLG9CQUFXLENBQUUsaUJBQVEsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDO1FBQy9ILHNDQUFzQztRQUN0QyxJQUFJLENBQUMsQ0FBQyxhQUFhLFlBQVksR0FBRyxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFDaEQsY0FBYztRQUNkLGFBQWEsQ0FBQyxPQUFPLENBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDaEMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNEOzs7T0FHRztJQUNLLGdCQUFnQixDQUFDLElBQVksRUFBRSxVQUFrQixFQUFFLFFBQWtCO1FBQ3pFLE1BQU0sYUFBYSxHQUFpQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFXLENBQUUsUUFBUSxDQUFFLENBQUMsQ0FBQztRQUNqSSxNQUFNLFlBQVksR0FBaUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxvQkFBVyxDQUFFLFFBQVEsQ0FBRSxDQUFDLENBQUM7UUFDMUgsYUFBYSxDQUFDLE9BQU8sQ0FBRSxZQUFZLENBQUMsRUFBRTtZQUNsQyxNQUFNLFlBQVksR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDckgsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDekIsZUFBZTtnQkFDZixNQUFNLElBQUksR0FBVyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzVDLDJCQUEyQjtnQkFDM0IsSUFBSSxXQUE0QixDQUFDO2dCQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDekIsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztpQkFDckc7cUJBQU07b0JBQ0gsV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3JDLElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxLQUFLLFlBQVksQ0FBQyxXQUFXLEVBQUUsRUFBRTt3QkFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO3FCQUN0RjtpQkFDSjtnQkFDRCxRQUFRO2dCQUNSLFdBQVcsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQzFEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNLLGNBQWMsQ0FBQyxJQUFZLEVBQUUsVUFBa0IsRUFBRSxRQUFrQjtRQUN2RSxNQUFNLGFBQWEsR0FBaUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxvQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDL0gsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNqQyxNQUFNLFlBQVksR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDckgsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDekIsZUFBZTtnQkFDZixNQUFNLElBQUksR0FBVyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzVDLDJCQUEyQjtnQkFDM0IsTUFBTSxXQUFXLEdBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDekgsUUFBUTtnQkFDUixXQUFXLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQzthQUN4RDtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBN0dELHdDQTZHQyJ9