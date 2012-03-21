/**
 * Backbone localStorage Adapter
 * https://github.com/jeromegn/Backbone.localStorage
 */

(function() {
  // A simple module to replace `Backbone.sync` with *localStorage*-based
  // persistence. Models are given GUIDS, and saved into a JSON object. Simple
  // as that.

  // Generate four random hex digits.
  function S4() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
     return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }

  // Our Store is represented by a single JS object in *localStorage*. Create it
  // with a meaningful name, like the name you'd give a table.
  // window.Store is deprectated, use Backbone.LocalStorage instead
  Backbone.LocalStorage = function(name, singleton) {
    this.name = name;
    this.singleton = singleton;
    this.createOrRetrieveRecords();
  };

  _.extend(Backbone.LocalStorage.prototype, {

    createOrRetrieveRecords: function() {
      if (!this.singleton) {
        var store = this.localStorage().getItem(this.name);
        this.records = (store && store.split(",")) || [];
      }
    },

    addRecord: function(model) {
      if (!this.singleton) {
        if (!_.include(this.records, model.id.toString())) {
          this.records.push(model.id.toString());
          this.save();
        }
      }
    },

    // Return the array of all models currently in storage.
    getAllRecords: function() {
      if (!this.singleton) {
        return _(this.records).chain()
            .map(function(id){
              return JSON.parse(this.localStorage().getItem( this.getKey(id) ));
            }, this)
            .compact()
            .value();
      }
    },

    getKey: function(id) {
      if (this.singleton) {
        return this.name;
      }
      else {
        if (id) return this.name + '-' + id;
        else return undefined;
      }
    },

    // Giving a model a (hopefully)-unique GUID, if it doesn't already
    // have an id of it's own.
    createId: function(model) {
      if (!model.id && !this.singleton) {
        model.id = model.attributes[model.idAttribute] = guid();
      }
    },

    // Save the current state of the **Store** to *localStorage*.
    save: function() {
      if (!this.singleton) {
        this.localStorage().setItem(this.name, this.records.join(","));
      }
    },

    // Backbone skips the sync() method for models where isNew() === true
    // (models without an `id` property)
    // This is a hack to get around that and actually remove singletons from localstorage
    onDestroy: function() {
      this.localStorage.destroy(this);
    },

    // Add a model
    create: function(model) {
      this.createId(model);
      if (this.singleton) {
        model.unbind('destroy', this.onDestroy, model);
        model.bind('destroy', this.onDestroy, model);
      }
      return this.update(model);
    },

    // Update a model by replacing its copy in `this.data`.
    update: function(model) {
      var key = this.getKey(model.id);
      this.localStorage().setItem(key, JSON.stringify(model));
      this.addRecord(model);
      return model;
    },

    // Retrieve a model from `this.data` by id.
    find: function(model) {
      var key = this.getKey(model.id);
      return key ? JSON.parse(this.localStorage().getItem(key)) : this.getAllRecords();
    },

    // Delete a model from `this.data`, returning it.
    destroy: function(model) {
      var key = this.getKey(model.id);
      this.localStorage().removeItem(key);
      if (!this.singleton) {
        this.records = _.reject(this.records, function(record_id){
          return record_id == model.id.toString();
        });
        this.save();
      }
      return model;
    },

    localStorage: function() {
        return localStorage;
    }

  });

  // localSync delegate to the model or collection's
  // *localStorage* property, which should be an instance of `Store`.
  // window.Store.sync and Backbone.localSync is deprectated, use Backbone.LocalStorage.sync instead
  Backbone.localSync = function(method, model, options, error) {

    var resp;
    var store = model.localStorage || model.collection.localStorage;

    switch (method) {
      case "read":    resp = store.find(model);       break;
      case "create":  resp = store.create(model);     break;
      case "update":  resp = store.update(model);     break;
      case "delete":  resp = store.destroy(model);    break;
    }

    if (resp) {
      options.success(resp);
    } else {
      options.error("Record not found");
    }
  };

})();