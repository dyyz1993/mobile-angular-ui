'use strict';

describe('core', function() {
  describe('outerClick', function() {

    function click($el) {
      var el = $el[0];
      var ev = document.createEvent('MouseEvent');
      ev.initMouseEvent(
          'click',
          true /* bubble */, true /* cancelable */,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      el.dispatchEvent(ev);
    }

    function tap($el) {
      var el = $el[0];
      var ev = document.createEvent('MouseEvent');
      ev.initMouseEvent(
          'tap',
          true /* bubble */, true /* cancelable */,
          window, null,
          0, 0, 0, 0, /* coordinates */
          false, false, false, false, /* modifier keys */
          0 /*left*/, null
      );
      el.dispatchEvent(ev);
    }

    var scope;
    var compile;
    var isAncestorOrSelf;
    var bindOuterClick;
    var body;
    var $document;
    var $timeout;

    beforeEach(function() {
      module('mobile-angular-ui.core.outerClick');
      inject(function($rootScope, $compile, _mauiIsAncestorOrSelf, _bindOuterClick_, _$document_, _$timeout_) {
        scope = $rootScope.$new();
        compile = $compile;
        isAncestorOrSelf = _mauiIsAncestorOrSelf;
        bindOuterClick = _bindOuterClick_;
        $document = _$document_;
        body = angular.element($document[0].body);
        $timeout = _$timeout_;
      });
    });

    describe('_mauiIsAncestorOrSelf', function() {
      it('returns true if target is parent of element', function() {
        var elem = angular.element('<div></div>');
        var target = angular.element('<div></div>');
        target.append(elem);
        expect(isAncestorOrSelf(elem, target)).toBe(true);
      });

      it('returns true if target is element', function() {
        var elem = angular.element('<div></div>');
        expect(isAncestorOrSelf(elem, elem)).toBe(true);
      });

      it('returns false if target is child of element', function() {
        var elem = angular.element('<div></div>');
        var target = angular.element('<div></div>');
        elem.append(target);
        expect(isAncestorOrSelf(elem, target)).toBe(false);
      });
    });

    describe('bindOuterClick', function() {
      it('runs callback on click on parent', function() {
        var elem = angular.element('<div></div>');
        var wrapper = angular.element('<div></div>');
        var callback = jasmine.createSpy('callback');
        wrapper.append(elem);
        body.append(wrapper);
        bindOuterClick(scope, elem, callback);
        click(wrapper);
        expect(callback).toHaveBeenCalled();
      });

      it('runs callback on click on sibling', function() {
        var elem = angular.element('<div></div>');
        var elem2 = angular.element('<div></div>');
        var wrapper = angular.element('<div></div>');
        var callback = jasmine.createSpy('callback');
        wrapper.append(elem);
        wrapper.append(elem2);
        body.append(wrapper);
        bindOuterClick(scope, elem, callback);
        click(elem2);
        expect(callback).toHaveBeenCalled();
      });

      it('does not run callback on click on self', function() {
        var elem = angular.element('<div></div>');
        body.append(elem);
        var callback = jasmine.createSpy('callback');
        bindOuterClick(scope, elem, callback);
        click(elem);
        expect(callback).not.toHaveBeenCalled();
      });

      it('does not run callback on click on child', function() {
        var elem = angular.element('<div></div>');
        var child = angular.element('<div></div>');
        elem.append(child);
        body.append(elem);
        var callback = jasmine.createSpy('callback');
        bindOuterClick(scope, elem, callback);
        click(child);
        expect(callback).not.toHaveBeenCalled();
      });

      it('runs callback on tap on parent', function() {
        var elem = angular.element('<div></div>');
        var wrapper = angular.element('<div></div>');
        var callback = jasmine.createSpy('callback');
        wrapper.append(elem);
        body.append(wrapper);
        bindOuterClick(scope, elem, callback);
        tap(wrapper);
        expect(callback).toHaveBeenCalled();
      });

      it('runs callback on tap on sibling', function() {
        var elem = angular.element('<div></div>');
        var elem2 = angular.element('<div></div>');
        var wrapper = angular.element('<div></div>');
        var callback = jasmine.createSpy('callback');
        wrapper.append(elem);
        wrapper.append(elem2);
        body.append(wrapper);
        bindOuterClick(scope, elem, callback);
        tap(elem2);
        expect(callback).toHaveBeenCalled();
      });

      it('does not run callback on tap on self', function() {
        var elem = angular.element('<div></div>');
        body.append(elem);
        var callback = jasmine.createSpy('callback');
        bindOuterClick(scope, elem, callback);
        tap(elem);
        expect(callback).not.toHaveBeenCalled();
      });

      it('does not run callback on tap on child', function() {
        var elem = angular.element('<div></div>');
        var child = angular.element('<div></div>');
        elem.append(child);
        body.append(elem);
        var callback = jasmine.createSpy('callback');
        bindOuterClick(scope, elem, callback);
        tap(child);
        expect(callback).not.toHaveBeenCalled();
      });

      it('checks condition if passed', function() {
        var elem = angular.element('<div></div>');
        var condition = jasmine.createSpy('condition');
        bindOuterClick(scope, elem, null, condition);
        scope.$digest();
        expect(condition).toHaveBeenCalled();
      });

      it('runs callback if condition is matched', function() {
        var elem = angular.element('<div></div>');
        var wrapper = angular.element('<div></div>');
        var callback = jasmine.createSpy('callback');
        wrapper.append(elem);
        body.append(wrapper);
        bindOuterClick(scope, elem, callback, function() {
          return true;
        });
        scope.$digest();
        $timeout.flush();
        click(wrapper);
        expect(callback).toHaveBeenCalled();
      });

      it('unbinds outerClick if condition is not matched', function() {
        var elem = angular.element('<div></div>');
        spyOn($document, 'on');
        spyOn($document, 'unbind');
        bindOuterClick(scope, elem, null, function() {
          return false;
        });

        scope.$digest();

        expect($document.on).not.toHaveBeenCalled();
        expect($document.unbind).toHaveBeenCalled();
      });

      it('unbinds outerClick on scope destroy', function() {
        var elem = angular.element('<div></div>');
        spyOn($document, 'unbind');
        bindOuterClick(scope, elem);
        scope.$destroy();
        expect($document.unbind).toHaveBeenCalled();
      });
    });

    describe('uiOuterClick', function() {
      it('should evaluate expression on outerClick', function() {
        scope.callback = jasmine.createSpy('callback');
        var elem = angular.element('<div ui-outer-click="callback()" />');
        var directiveElement = compile(elem)(scope);
        body.append(directiveElement);
        scope.$digest();
        click(body);
        expect(scope.callback).toHaveBeenCalled();
      });
    });
  });
});
