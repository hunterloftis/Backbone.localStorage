$(document).ready(function() {
    
    // Replace the default sync implementation
    Backbone.sync = Backbone.localSync;

    var Library = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("libraryStore")
    });

    var attrs = {
        title  : 'The Tempest',
        author : 'Bill Shakespeare',
        length : 123
    };
    
    var library = null;
    
    module("localStorage on collections", {
        setup: function() {
            window.localStorage.clear();
            library = new Library();
        }
    });
    
    test("should be empty initially", function() {
        equals(library.length, 0, 'empty initially');
        library.fetch();
        equals(library.length, 0, 'empty read');
    });
    
    test("should create item", function() {
        library.create(attrs);
        equals(library.length, 1, 'one item added');
        equals(library.first().get('title'), 'The Tempest', 'title was read');
        equals(library.first().get('author'), 'Bill Shakespeare', 'author was read');
        equals(library.first().get('length'), 123, 'length was read');
    });
	
	test("should discard unsaved changes on fetch", function() {
        library.create(attrs);
        library.first().set({ 'title': "Wombat's Fun Adventure" });
        equals(library.first().get('title'), "Wombat's Fun Adventure", 'title changed, but not saved');
        library.fetch();
        equals(library.first().get('title'), 'The Tempest', 'title was read');
	});
	
	test("should persist changes", function(){
        library.create(attrs);
        equals(library.first().get('author'), 'Bill Shakespeare', 'author was read');
        library.first().save({ author: 'William Shakespeare' });
        library.fetch();
        equals(library.first().get('author'), 'William Shakespeare', 'verify author update');
	});
    
    test("should allow to change id", function() {
        library.create(attrs);
        library.first().save({id: '1-the-tempest', author: 'William Shakespeare'});
        equals(library.first().get('id'), '1-the-tempest', 'verify ID update');
        equals(library.first().get('title'), 'The Tempest', 'verify title is still there');
        equals(library.first().get('author'), 'William Shakespeare', 'verify author update');
        equals(library.first().get('length'), 123, 'verify length is still there');
		
		library.fetch();
		equals(library.length, 2, 'should not auto remove first object when changing ID');
    });
    
    test("should remove from collection", function() {
        _(23).times(function(index) {
            library.create({id: index});
        });
        _(library.toArray()).chain().clone().each(function(book) {
            book.destroy();
        });
        equals(library.length, 0, 'item was destroyed and library is empty');
        library.fetch()
        equals(library.length, 0, 'item was destroyed and library is empty even after fetch');
    });
	
    test("should not try to load items from localstorage if they are not there anymore", function() {
        library.create(attrs);
        localStorage.clear();
        library.fetch();
        equals(0, library.length);
    });
    
    test("should load from session store without server request", function() {
        library.create(attrs);
        
        secondLibrary = new Library();
        secondLibrary.fetch();
        equals(1, secondLibrary.length);
    });
    
    test("should cope with arbitrary idAttributes", function() {
        var Model = Backbone.Model.extend({
            idAttribute: '_id'
        });
        var Collection = Backbone.Collection.extend({
            model: Model,
            localStorage: new Backbone.LocalStorage('strangeID')
        });
        
        var collection = new Collection();
        collection.create({});
        equals(collection.first().id, collection.first().get('_id'));
    });

	
    module("localStorage on models", {
		setup: function() {
            window.localStorage.clear();
			book = new Book();
		}
    });
	
    var Book = Backbone.Model.extend({
        defaults: {
            title  : 'The Tempest',
            author : 'Bill Shakespeare',
            length : 123
        },
		localStorage : new Backbone.LocalStorage('TheTempest')
    });
	
	var book = null;
    
	test("should overwrite unsaved changes when fetching", function() {
		book.save();
        book.set({ 'title': "Wombat's Fun Adventure" });
        book.fetch();
        equals(book.get('title'), 'The Tempest', 'model created');
	});
	
	test("should persist changes", function(){
        book.save({ author: 'William Shakespeare'});
        book.fetch();
        equals(book.get('author'), 'William Shakespeare', 'author successfully updated');
        equals(book.get('length'), 123, 'verify length is still there');
	});

	test("should remove book when destroying", function() {
		book.save({author: 'fnord'})
		equals(Book.prototype.localStorage.getAllRecords().length, 1, 'book removed');
		book.destroy()
		equals(Book.prototype.localStorage.getAllRecords().length, 0, 'book removed');
	});
	
    module("localStorage on singleton models", {
        setup: function() {
            window.localStorage.clear();
            prefs = new Preferences();
        }
    });
    
    var Preferences = Backbone.Model.extend({
        defaults: {
            display: 'fullscreen',
            menu: ['file','edit'],
            items: 30
        },
        localStorage : new Backbone.LocalStorage('Preferences', true)
    });
    
    var prefs = null;
    
    test("should start with a basic model", function() {
        var obj = prefs.toJSON();
        equals(obj.display, 'fullscreen', 'model created');
        equals(obj.items, 30);
        equals(obj.menu[0], 'file');
        equals(obj.menu[1], 'edit');
    });
    
    test("should persist changes", function() {
        prefs.set({ display: 'normal' });
        prefs.save();
        prefs.fetch();
        equals(prefs.get('display'), 'normal', 'display successfully updated');
        equals(prefs.get('items'), 30, 'items still there');
    });

    test("should not add an id", function() {
        equals(typeof prefs.id, 'undefined', 'prefs.id is undefined pre-save');
        prefs.save();
        prefs.fetch();
        equals(typeof prefs.id, 'undefined', 'prefs.id is undefined post-save');
    });

    test("should be able to be destroyed and reloaded without id", function() {
        prefs.save({ display: 'experimental' });
        prefs = null;
        prefs = new Preferences();
        equals(prefs.get('display'), 'fullscreen', 'display defaults to fullscreen');
        prefs.fetch();
        equals(prefs.get('display'), 'experimental', 'display is experimental');
    });

    test("should be able to add an id but still manipulate the same object", function() {
        prefs.save({ id: 'myid' });
        prefs = null;
        prefs = new Preferences();
        equals(typeof prefs.id, 'undefined', 'id defaults to undefined');
        prefs.fetch();
        equals(prefs.id, 'myid', 'id is set to myid');
    });

    test("should remove prefs when destroying", function() {
        equals(prefs.get('display'), 'fullscreen', 'defaults to fullscreen');
        prefs.save({ display: 'minimized' });
        prefs.fetch();
        equals(prefs.get('display'), 'minimized', 'initially saves minimized');
        prefs.destroy();
        prefs = null;
        prefs = new Preferences();
        prefs.fetch();
        equals(prefs.get('display'), 'fullscreen', 'fetches default data after destroy');
    });

});