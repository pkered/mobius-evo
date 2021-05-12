"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GIMetaData_1 = require("./GIMetaData");
const GIModelData_1 = require("./GIModelData");
const common_id_funcs_1 = require("./common_id_funcs");
/**
 * Geo-info model class.
 */
class GIModel {
    // public outputSnapshot: number;
    /**
     * Constructor
     */
    constructor(meta_data) {
        this.debug = true;
        if (meta_data === undefined) {
            this.metadata = new GIMetaData_1.GIMetaData();
        }
        else {
            this.metadata = meta_data;
        }
        this.modeldata = new GIModelData_1.GIModelData(this);
        this.nextSnapshot();
    }
    /**
     * Get the current time stamp
     */
    getActiveSnapshot() {
        return this.modeldata.active_ssid;
    }
    /**
     * Set the current time stamp backwards to a prevous time stamp.
     * This allows you to roll back in time after executing a global function.
     */
    setActiveSnapshot(ssid) {
        this.modeldata.active_ssid = ssid;
    }
    /**
     *
     * @param id Starts a new snapshot with the given ID.
     * @param include The other snapshots to include in the snapshot.
     */
    nextSnapshot(include) {
        // increment time stamp
        this.modeldata.nextSnapshot();
        // get time stamp
        const ssid = this.modeldata.active_ssid;
        // add snapshot
        this.modeldata.geom.snapshot.addSnapshot(ssid, include);
        this.modeldata.attribs.snapshot.addSnapshot(ssid, include);
        // return the new ssid
        return ssid;
    }
    /**
     * Add a set of ents from the specified snapshot to the active snapshot.
     * @param from_ssid Snapshot to copy ents from
     * @param ents The list of ents to add.
     */
    addEntsToActiveSnapshot(from_ssid, ents) {
        // geometry
        const ents_sets = this.modeldata.geom.snapshot.getSubEntsSets(from_ssid, ents);
        this.modeldata.geom.snapshot.copyEntsToActiveSnapshot(from_ssid, this.modeldata.geom.snapshot.getSubEnts(ents_sets));
        // attributes
        // TODO needs to be optimized, we should iterate over the sets directly - it will be faster
        this.modeldata.geom.snapshot.addTopoToSubEntsSets(ents_sets);
        this.modeldata.attribs.snapshot.copyEntsToActiveSnapshot(from_ssid, this.modeldata.geom.snapshot.getSubEnts(ents_sets));
    }
    /**
     * Gets a set of ents from a snapshot.
     * @param ssid
     */
    getEntsFromSnapshot(ssid) {
        return this.modeldata.geom.snapshot.getAllEnts(ssid);
    }
    /**
     * Deletes a snapshot.
     * @param ssid
     */
    delSnapshots(ssids) {
        for (const ssid of ssids) {
            this.modeldata.geom.snapshot.delSnapshot(ssid);
            this.modeldata.attribs.snapshot.delSnapshot(ssid);
        }
    }
    /**
     * Updates the time stamp of the entities to the current time stamp.
     * @param ents
     */
    updateEntsTimestamp(ents) {
        for (const [ent_type, ent_i] of ents) {
            this.modeldata.updateEntTs(ent_type, ent_i);
        }
    }
    /**
     *
     * @param gf_start_ents
     */
    prepGlobalFunc(gf_start_ids) {
        gf_start_ids = Array.isArray(gf_start_ids) ? gf_start_ids : [gf_start_ids];
        // @ts-ignore
        gf_start_ids = gf_start_ids.flat();
        const gf_start_ents = common_id_funcs_1.idsBreak(gf_start_ids);
        const curr_ss = this.getActiveSnapshot();
        this.nextSnapshot();
        // console.log('>>> ents to be added to gf_start_ss:\n', gf_start_ents_tree);
        this.addEntsToActiveSnapshot(curr_ss, gf_start_ents);
        // console.log('>>> gf_start_ss ents after adding:\n', this.getEntsFromSnapshot(gf_start_ss));
        return curr_ss;
    }
    /**
     *
     * @param ssid
     */
    postGlobalFunc(curr_ss) {
        const gf_end_ss = this.getActiveSnapshot();
        const gf_end_ents = this.getEntsFromSnapshot(gf_end_ss);
        const gf_all_ss = [];
        for (let i = gf_end_ss; i > curr_ss; i--) {
            gf_all_ss.push(i);
        }
        this.setActiveSnapshot(curr_ss);
        // console.log('>>> ents to be added to curr_ss:\n', gf_end_ents);
        this.addEntsToActiveSnapshot(gf_end_ss, gf_end_ents);
        // console.log('>>> curr_ss ents after adding:\n', this.getEntsFromSnapshot(curr_ss));
        this.delSnapshots(gf_all_ss);
    }
    // /**
    //  * Set all data from a JSON string.
    //  * This includes both the meta data and the model data.
    //  * Any existing metadata will be kept, the new data gets appended.
    //  * Any existing model data wil be deleted.
    //  * @param meta
    //  */
    // public setJSONStr(ssid: number, json_str: string): void {
    //     // const ssid = this.modeldata.timestamp;
    //     const json_data: IModelJSON = JSON.parse(json_str);
    //     // merge the meta data
    //     this.metadata.mergeJSONData(json_data);
    //     // set the model data
    //     this.modeldata.importGI(ssid, json_data.model_data);
    // }
    // /**
    //  * Gets all data as a JSON string.
    //  * This includes both the meta data and the model data.
    //  */
    // public getJSONStr(ssid: number): string {
    //     // const ssid = this.modeldata.timestamp;
    //     const model_data: IModelJSONData = this.modeldata.exportGI(ssid);
    //     const meta_data: IMetaJSONData = this.metadata.getJSONData(model_data);
    //     const data: IModelJSON = {
    //         meta_data: meta_data,
    //         model_data: model_data
    //     };
    //     return JSON.stringify(data);
    // }
    // /**
    //  * Sets the data in this model from a JSON data object using shallow copy.
    //  * Any existing data in the model is deleted.
    //  * @param model_json_data The JSON data.
    //  */
    // public setModelData (ssid: number, model_json_data: IModelJSONData): void {
    //     // const ssid = this.modeldata.timestamp;
    //     this.modeldata.importGI(ssid, model_json_data);
    // }
    // /**
    //  * Returns the JSON data for this model using shallow copy.
    //  */
    // public getModelData(ssid: number): IModelJSONData {
    //     // const ssid = this.modeldata.timestamp;
    //     return this.modeldata.exportGI(ssid);
    // }
    /**
     * Import a GI model.
     * @param meta
     */
    importGI(model_json_data_str) {
        return this.modeldata.importGI(JSON.parse(model_json_data_str));
    }
    /**
     * Export a GI model.
     */
    exportGI(ents) {
        return JSON.stringify(this.modeldata.exportGI(ents));
    }
    /**
     * Set the meta data object.
     * Data is not copied.
     * @param meta
     */
    setMetaData(meta) {
        this.metadata = meta;
    }
    /**
     * Get the meta data object.
     * Data is not copied
     */
    getMetaData() {
        return this.metadata;
    }
    // /**
    //  * Returns a deep clone of this model.
    //  * Any deleted entities will remain.
    //  * Entity IDs will not change.
    //  */
    // public clone(): GIModel {
    //     const ssid = this.modeldata.timestamp;
    //     // console.log("CLONE");
    //     const clone: GIModel = new GIModel();
    //     clone.metadata = this.metadata;
    //     clone.modeldata = this.modeldata.clone(ssid);
    //     // clone.modeldata.merge(this.modeldata);
    //     return clone;
    // }
    // /**
    //  * Deep copies the model data from a second model into this model.
    //  * Meta data is assumed to be the same for both models.
    //  * The existing model data in this model is not deleted.
    //  * Entity IDs will not change.
    //  * @param model_data The GI model.
    //  */
    // public merge(model: GIModel): void {
    //     const ssid = this.modeldata.timestamp;
    //     // console.log("MERGE");
    //     this.modeldata.merge(ssid, model.modeldata);
    // }
    // /**
    //  * Deep copies the model data from a second model into this model.
    //  * Meta data is assumed to be the same for both models.
    //  * The existing model data in this model is not deleted.
    //  * The Entity IDs in this model will not change.
    //  * The Entity IDs in the second model will change.
    //  * @param model_data The GI model.
    //  */
    // public append(ssid: number, ssid2: number, model: GIModel): void {
    //     // const ssid = this.modeldata.timestamp;
    //     this.modeldata.append(ssid, ssid2, model.modeldata);
    // }
    // /**
    //  * Renumber entities in this model.
    //  */
    // public purge(): void {
    //     const ssid = this.modeldata.timestamp;
    //     this.modeldata = this.modeldata.purge(ssid);
    // }
    /**
     * Check model for internal consistency
     */
    check() {
        return this.modeldata.check();
    }
    /**
     * Compares two models.
     * Checks that every entity in this model also exists in the other model.
     * ~
     * Additional entitis in the other model will not affect the score.
     * Attributes at the model level are ignored.
     * ~
     * For grading, this model is assumed to be the answer model, and the other model is assumed to be
     * the model submitted by the student.
     * ~
     * Both models will be modified in the process of cpmparing.
     * ~
     * @param model The model to compare with.
     */
    compare(model, normalize, check_geom_equality, check_attrib_equality) {
        return this.modeldata.compare(model, normalize, check_geom_equality, check_attrib_equality);
    }
    /**
     * Get the threejs data for this model.
     */
    get3jsData(ssid) {
        return this.modeldata.threejs.get3jsData(ssid);
    }
}
exports.GIModel = GIModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2dlbl9ldmFsX3Byb2Nlc3NfYmFja2VuZC9zcmMvbGlicy9nZW8taW5mby9HSU1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkNBQTBDO0FBQzFDLCtDQUE0QztBQUM1Qyx1REFBNkM7QUFHN0M7O0dBRUc7QUFDSCxNQUFhLE9BQU87SUFLaEIsaUNBQWlDO0lBRWpDOztPQUVHO0lBQ0gsWUFBWSxTQUFzQjtRQU4zQixVQUFLLEdBQUcsSUFBSSxDQUFDO1FBT2hCLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1NBQ3BDO2FBQU07WUFDSCxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztTQUM3QjtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0Q7O09BRUc7SUFDSSxpQkFBaUI7UUFDcEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUN0QyxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0ksaUJBQWlCLENBQUMsSUFBWTtRQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDdEMsQ0FBQztJQUNEOzs7O09BSUc7SUFDSSxZQUFZLENBQUMsT0FBa0I7UUFDbEMsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDOUIsaUJBQWlCO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDO1FBQ3hDLGVBQWU7UUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMs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