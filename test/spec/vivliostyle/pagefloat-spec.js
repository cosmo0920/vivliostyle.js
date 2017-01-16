describe("pagefloat", function() {
    var module = vivliostyle.pagefloat;
    var FloatReference = module.FloatReference;
    var PageFloat = module.PageFloat;
    var PageFloatStore = module.PageFloatStore;
    var PageFloatFragment = module.PageFloatFragment;
    var PageFloatContinuation = module.PageFloatContinuation;
    var PageFloatLayoutContext = module.PageFloatLayoutContext;

    describe("PageFloatStore", function() {
        var store;
        beforeEach(function() {
            store = new PageFloatStore();
        });

        describe("#addPageFloat", function() {
            it("adds a PageFloat", function() {
                var sourceNode = {};
                var float = new PageFloat(sourceNode, FloatReference.COLUMN, "block-start");

                expect(store.floats).not.toContain(float);

                store.addPageFloat(float);

                expect(store.floats).toContain(float);
            });

            it("assign a new ID to the PageFloat", function() {
                var float = new PageFloat({}, FloatReference.COLUMN, "block-start");

                expect(float.id).toBe(null);

                store.addPageFloat(float);

                expect(float.id).toBe("pf0");

                float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                store.addPageFloat(float);

                expect(float.id).toBe("pf1");
            });

            it("throws an error if a float with the same source node is already registered", function() {
                var sourceNode = {};
                var float = new PageFloat(sourceNode, FloatReference.COLUMN, "block-start");
                store.addPageFloat(float);

                expect(store.floats).toContain(float);

                float = new PageFloat(sourceNode, FloatReference.COLUMN, "block-start");

                expect(function() { store.addPageFloat(float); }).toThrow();
            });
        });

        describe("#findPageFloatBySourceNode", function() {
            it("returns a registered page float associated with the specified source node", function() {
                var sourceNode = {};
                var float = new PageFloat(sourceNode, FloatReference.COLUMN, "block-start");
                store.addPageFloat(float);

                expect(store.findPageFloatBySourceNode(sourceNode)).toBe(float);
            });

            it("returns null when no page float with the specified source node is registered", function() {
                var sourceNode = {};
                var float = new PageFloat(sourceNode, FloatReference.COLUMN, "block-start");
                store.addPageFloat(float);

                expect(store.findPageFloatBySourceNode({})).toBe(null);
            });
        });
    });

    describe("PageFloatLayoutContext", function() {
        var rootContext;
        beforeEach(function() {
            rootContext = new PageFloatLayoutContext(null, null, null, null, null, null);
        });

        describe("constructor", function() {
            it("uses writing-mode and direction values of the parent if they are not specified", function() {
                var context = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null,
                    adapt.css.ident.vertical_rl, adapt.css.ident.rtl);

                expect(context.writingMode).toBe(adapt.css.ident.vertical_rl);
                expect(context.direction).toBe(adapt.css.ident.rtl);

                context = new PageFloatLayoutContext(context, FloatReference.REGION, null, null, null, null);

                expect(context.writingMode).toBe(adapt.css.ident.vertical_rl);
                expect(context.direction).toBe(adapt.css.ident.rtl);
            });

            it("registers itself to the parent as a child", function() {
                var pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);

                expect(rootContext.children).toEqual([pageContext]);

                var regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);

                expect(pageContext.children).toEqual([regionContext]);
            });
        });

        describe("#getPreviousSibling", function() {
            it("returns null if the parent has no children preceding the child", function() {
                var context = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);

                expect(context.getPreviousSibling()).toBe(null);
            });

            it("returns the previous sibling if it has the same floatReference", function() {
                var context1 = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var context2 = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var context3 = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);

                expect(context3.getPreviousSibling()).toBe(context2);
                expect(context2.getPreviousSibling()).toBe(context1);
                expect(context1.getPreviousSibling()).toBe(null);
            });

            it("returns the last child with the same floatReference of the previous sibling if it has a different floatReference", function() {
                var context1 = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var context2 = new PageFloatLayoutContext(context1, FloatReference.REGION, null, null, null, null);
                var context3 = new PageFloatLayoutContext(context2, FloatReference.COLUMN, null, null, null, null);
                var context4 = new PageFloatLayoutContext(context1, FloatReference.REGION, null, null, null, null);
                var context5 = new PageFloatLayoutContext(context4, FloatReference.COLUMN, null, null, null, null);
                var context6 = new PageFloatLayoutContext(context4, FloatReference.COLUMN, null, null, null, null);
                var context7 = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var context8 = new PageFloatLayoutContext(context7, FloatReference.REGION, null, null, null, null);
                var context9 = new PageFloatLayoutContext(context8, FloatReference.COLUMN, null, null, null, null);

                expect(context9.getPreviousSibling()).toBe(context6);
                expect(context8.getPreviousSibling()).toBe(context4);
                expect(context7.getPreviousSibling()).toBe(context1);
                expect(context5.getPreviousSibling()).toBe(context3);
            });
        });

        describe("#findPageFloatBySourceNode", function() {
            it("returns a page float registered by PageFloatLayoutContext with the same root PageFloatLayoutContext", function() {
                var context1 = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var context2 = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var sourceNode1 = {};
                var float1 = new PageFloat(sourceNode1, FloatReference.PAGE, "block-start");
                context1.addPageFloat(float1);
                var sourceNode2 = {};
                var float2 = new PageFloat(sourceNode2, FloatReference.PAGE, "block-start");
                context2.addPageFloat(float2);

                expect(context1.findPageFloatBySourceNode(sourceNode1)).toBe(float1);
                expect(context1.findPageFloatBySourceNode(sourceNode2)).toBe(float2);
                expect(context2.findPageFloatBySourceNode(sourceNode1)).toBe(float1);
                expect(context2.findPageFloatBySourceNode(sourceNode2)).toBe(float2);
            });
        });

        describe("#forbid, #isForbidden", function() {
            it("returns if the page float is forbidden in the context by #forbid method", function() {
                var context = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var float = new PageFloat({}, FloatReference.PAGE, "block-start");
                context.addPageFloat(float);

                expect(context.isForbidden(float)).toBe(false);

                context.forbid(float);

                expect(context.isForbidden(float)).toBe(true);
            });

            it("returns true if the page float is forbidden by one of ancestors of the context", function() {
                var pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);
                var columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                var float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.addPageFloat(float);
                columnContext.forbid(float);

                expect(columnContext.isForbidden(float)).toBe(true);
                expect(function() { regionContext.isForbidden(float); }).toThrow();

                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.isForbidden(float)).toBe(false);

                float = new PageFloat({}, FloatReference.REGION, "block-start");
                columnContext.addPageFloat(float);
                columnContext.forbid(float);

                expect(columnContext.isForbidden(float)).toBe(true);
                expect(regionContext.isForbidden(float)).toBe(true);
                expect(function() { pageContext.isForbidden(float); }).toThrow();

                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.isForbidden(float)).toBe(true);

                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.isForbidden(float)).toBe(false);
                expect(regionContext.isForbidden(float)).toBe(false);
                expect(function() { pageContext.isForbidden(float); }).toThrow();

                float = new PageFloat({}, FloatReference.PAGE, "block-start");
                columnContext.addPageFloat(float);
                columnContext.forbid(float);

                expect(columnContext.isForbidden(float)).toBe(true);
                expect(regionContext.isForbidden(float)).toBe(true);
                expect(pageContext.isForbidden(float)).toBe(true);

                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.isForbidden(float)).toBe(true);

                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.isForbidden(float)).toBe(true);
                expect(regionContext.isForbidden(float)).toBe(true);

                pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.isForbidden(float)).toBe(false);
                expect(regionContext.isForbidden(float)).toBe(false);
                expect(pageContext.isForbidden(float)).toBe(false);
            });
        });

        describe("#addPageFloatFragment, #findPageFloatFragment", function() {
            var pageContext, regionContext, columnContext, area;
            function reset() {
                pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);
                [pageContext, regionContext, columnContext].forEach(function(context) {
                    spyOn(context, "invalidate");
                    spyOn(context, "addPageFloatFragment").and.callThrough();
                });
            }
            beforeEach(function() {
                area = { getOuterShape: jasmine.createSpy("getOuterShape") };
                reset();
            });

            it("A PageFloatFragment added by #addPageFloatFragment can be retrieved by #findPageFloatFragment", function() {
                pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                var float = new PageFloat({}, FloatReference.PAGE, "block-start");
                pageContext.addPageFloat(float);
                var fragment = new PageFloatFragment(float, area);

                expect(pageContext.findPageFloatFragment(float)).toBe(null);

                pageContext.addPageFloatFragment(fragment);

                expect(pageContext.findPageFloatFragment(float)).toBe(fragment);
            });

            it("A PageFloatFragment stored in one of the ancestors can be retrieved by #findPageFloatFragment", function() {
                var float = new PageFloat({}, FloatReference.REGION, "block-start");
                columnContext.addPageFloat(float);
                var fragment = new PageFloatFragment(float, area);
                columnContext.addPageFloatFragment(fragment);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.findPageFloatFragment(float)).toBe(fragment);
                expect(regionContext.findPageFloatFragment(float)).toBe(fragment);
                expect(function() { pageContext.findPageFloatFragment(float); }).toThrow();

                float = new PageFloat({}, FloatReference.PAGE, "block-start");
                columnContext.addPageFloat(float);
                fragment = new PageFloatFragment(float, area);
                columnContext.addPageFloatFragment(fragment);
                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                expect(columnContext.findPageFloatFragment(float)).toBe(fragment);
                expect(regionContext.findPageFloatFragment(float)).toBe(fragment);
                expect(pageContext.findPageFloatFragment(float)).toBe(fragment);
            });

            it("When a PageFloatFragment is added by #addPageFloatFragment, the corresponding PageFloatLayoutContext is invalidated", function() {
                var float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.addPageFloat(float);
                var fragment = new PageFloatFragment(float, area);
                columnContext.addPageFloatFragment(fragment);

                expect(columnContext.invalidate).toHaveBeenCalled();
                expect(regionContext.addPageFloatFragment).not.toHaveBeenCalled();

                reset();
                float = new PageFloat({}, FloatReference.REGION, "block-start");
                columnContext.addPageFloat(float);
                fragment = new PageFloatFragment(float, area);
                columnContext.addPageFloatFragment(fragment);

                expect(columnContext.invalidate).toHaveBeenCalled();
                expect(regionContext.addPageFloatFragment).toHaveBeenCalledWith(fragment);
                expect(regionContext.invalidate).toHaveBeenCalled();
                expect(pageContext.addPageFloatFragment).not.toHaveBeenCalledWith(fragment);

                reset();
                float = new PageFloat({}, FloatReference.PAGE, "block-start");
                columnContext.addPageFloat(float);
                fragment = new PageFloatFragment(float, area);
                columnContext.addPageFloatFragment(fragment);

                expect(columnContext.invalidate).toHaveBeenCalled();
                expect(regionContext.addPageFloatFragment).toHaveBeenCalledWith(fragment);
                expect(regionContext.invalidate).toHaveBeenCalled();
                expect(pageContext.addPageFloatFragment).toHaveBeenCalledWith(fragment);
                expect(pageContext.invalidate).toHaveBeenCalled();
            });
        });

        describe("#removePageFloatFragment", function() {
            var container, context, float, area, fragment;
            beforeEach(function() {
                context = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, container, null, null, null);
                spyOn(context, "invalidate");
                float = new PageFloat({}, FloatReference.PAGE, "block-start");
                context.addPageFloat(float);
                area = {
                    element: {
                        parentNode: {
                            removeChild: jasmine.createSpy("removeChild")
                        }
                    }
                };
                fragment = new PageFloatFragment(float, area);
                context.addPageFloatFragment(fragment);
                context.invalidate.calls.reset();
            });

            it("removes the specified PageFloatFragment", function() {
                expect(context.findPageFloatFragment(float)).toBe(fragment);

                context.removePageFloatFragment(fragment);

                expect(context.findPageFloatFragment(float)).toBe(null);
            });

            it("detaches the view node of the fragment", function() {
                context.removePageFloatFragment(fragment);

                expect(area.element.parentNode.removeChild).toHaveBeenCalledWith(area.element);
            });

            it("invalidates the context", function() {
                context.removePageFloatFragment(fragment);

                expect(context.invalidate).toHaveBeenCalled();
            });
        });

        describe("#registerPageFloatAnchor", function() {
            var pageContext, regionContext, columnContext, float, anchorViewNode;
            beforeEach(function() {
                pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, null, null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);
                anchorViewNode = {};
            });

            it("stores the anchor view node", function() {
                float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.addPageFloat(float);
                columnContext.registerPageFloatAnchor(float, anchorViewNode);

                expect(columnContext.floatAnchors[float.getId()]).toBe(anchorViewNode);
            });

            it("stores the anchor view node to the corresponding context", function() {
                float = new PageFloat({}, FloatReference.REGION, "block-start");
                columnContext.addPageFloat(float);
                columnContext.registerPageFloatAnchor(float, anchorViewNode);

                expect(columnContext.floatAnchors[float.getId()]).toBeUndefined();
                expect(regionContext.floatAnchors[float.getId()]).toBe(anchorViewNode);

                float = new PageFloat({}, FloatReference.PAGE, "block-start");
                columnContext.addPageFloat(float);
                columnContext.registerPageFloatAnchor(float, anchorViewNode);

                expect(columnContext.floatAnchors[float.getId()]).toBeUndefined();
                expect(regionContext.floatAnchors[float.getId()]).toBeUndefined();
                expect(pageContext.floatAnchors[float.getId()]).toBe(anchorViewNode);
            });
        });

        describe("#isAnchorAlreadyAppeared", function() {
            var container, context, float, id, anchorViewNode;
            beforeEach(function() {
                container = {
                    element: {
                        contains: jasmine.createSpy("contains")
                    }
                };
                context = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, container, "foo", null, null);
                float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                context.addPageFloat(float);
                id = float.getId();
                anchorViewNode = {};
            });

            it("returns false if the anchor view node is not registered", function() {
                expect(context.isAnchorAlreadyAppeared(id)).toBe(false);
            });

            it("returns false if the anchor view node if registered but not contained in the container", function() {
                container.element.contains.and.returnValue(false);
                context.registerPageFloatAnchor(float, anchorViewNode);

                expect(context.isAnchorAlreadyAppeared(id)).toBe(false);
                expect(container.element.contains).toHaveBeenCalledWith(anchorViewNode);
            });

            it("returns true if the anchor view node if registered and contained in the container", function() {
                container.element.contains.and.returnValue(true);
                context.registerPageFloatAnchor(float, anchorViewNode);

                expect(context.isAnchorAlreadyAppeared(id)).toBe(true);
                expect(container.element.contains).toHaveBeenCalledWith(anchorViewNode);
            });

            it("returns true if the float is deferred from a previous fragment", function() {
                container.element.contains.and.returnValue(false);
                context.floatsDeferredFromPrevious.push(new PageFloatContinuation(float, {}, "foo"));

                expect(context.isAnchorAlreadyAppeared(id)).toBe(true);
            });
        });

        describe("#deferPageFloat", function() {
            var pageContext, regionContext, columnContext, float;
            beforeEach(function() {
                pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, "foo", null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, "foo", null, null);
            });

            it("stores a PageFloatContinuation as a deferred float", function() {
                float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.addPageFloat(float);
                columnContext.deferPageFloat(float, {});

                expect(columnContext.floatsDeferredToNext.length).toBe(1);
                expect(columnContext.floatsDeferredToNext[0].flowName).toBe("foo");
            });

            it("replaces an existing deferred PageFloatContinuation with new one if there exists a deferred continuation of the same float", function() {
                float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.addPageFloat(float);
                var position1 = {};
                columnContext.deferPageFloat(float, position1);

                expect(columnContext.floatsDeferredToNext.length).toBe(1);
                expect(columnContext.floatsDeferredToNext[0].flowName).toBe("foo");
                expect(columnContext.floatsDeferredToNext[0].nodePosition).toBe(position1);

                var position2 = {};
                columnContext.deferPageFloat(float, position2);

                expect(columnContext.floatsDeferredToNext.length).toBe(1);
                expect(columnContext.floatsDeferredToNext[0].flowName).toBe("foo");
                expect(columnContext.floatsDeferredToNext[0].nodePosition).toBe(position2);
            });

            it("stores a PageFloatContinuation in the corresponding context as a deferred float", function() {
                float = new PageFloat({}, FloatReference.REGION, "block-start");
                columnContext.addPageFloat(float);
                columnContext.deferPageFloat(float, {});

                expect(columnContext.floatsDeferredToNext.length).toBe(0);
                expect(regionContext.floatsDeferredToNext.length).toBe(1);
                expect(regionContext.floatsDeferredToNext[0].flowName).toBe("foo");
            });
        });

        describe("getDeferredPageFloatContinuations", function() {
            var pageContext, regionContext, columnContext, cont1, cont2, cont3, cont4, cont5, cont6;
            beforeEach(function() {
                pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, "foo", null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, "foo", null, null);
                cont1 = new PageFloatContinuation({}, {}, "foo");
                pageContext.floatsDeferredFromPrevious.push(cont1);
                cont2 = new PageFloatContinuation({}, {}, "bar");
                pageContext.floatsDeferredFromPrevious.push(cont2);
                cont3 = new PageFloatContinuation({}, {}, "foo");
                regionContext.floatsDeferredFromPrevious.push(cont3);
                cont4 = new PageFloatContinuation({}, {}, "bar");
                regionContext.floatsDeferredFromPrevious.push(cont4);
                cont5 = new PageFloatContinuation({}, {}, "foo");
                columnContext.floatsDeferredFromPrevious.push(cont5);
                cont6 = new PageFloatContinuation({}, {}, "bar");
                columnContext.floatsDeferredFromPrevious.push(cont6);
            });

            it("returns all deferred PageFloatContinuations with the corresonding flow name in order of page, region and column", function() {
                expect(columnContext.getDeferredPageFloatContinuations()).toEqual([cont1, cont3, cont5]);
                expect(columnContext.getDeferredPageFloatContinuations("bar")).toEqual([cont2, cont4, cont6]);
            });

            it("returns all deferred PageFLoatContinuations in order of page, region and column when the context does not have a flow name and no flow name is specified as an argument", function() {
                expect(pageContext.getDeferredPageFloatContinuations()).toEqual([cont1, cont2]);
            });
        });

        describe("getPageFloatContinuationsDeferredToNext", function() {
            var pageContext, regionContext, columnContext, cont1, cont2, cont3, cont4, cont5, cont6;
            beforeEach(function() {
                pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, null, null, null, null);
                regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, null, "foo", null, null);
                columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, "foo", null, null);
                cont1 = new PageFloatContinuation({}, {}, "foo");
                pageContext.floatsDeferredToNext.push(cont1);
                cont2 = new PageFloatContinuation({}, {}, "bar");
                pageContext.floatsDeferredToNext.push(cont2);
                cont3 = new PageFloatContinuation({}, {}, "foo");
                regionContext.floatsDeferredToNext.push(cont3);
                cont4 = new PageFloatContinuation({}, {}, "bar");
                regionContext.floatsDeferredToNext.push(cont4);
                cont5 = new PageFloatContinuation({}, {}, "foo");
                columnContext.floatsDeferredToNext.push(cont5);
                cont6 = new PageFloatContinuation({}, {}, "bar");
                columnContext.floatsDeferredToNext.push(cont6);
            });

            it("returns all PageFloatContinuations deferred to the next fragmentainer with the corresonding flow name in order of page, region and column", function() {
                expect(columnContext.getPageFloatContinuationsDeferredToNext()).toEqual([cont1, cont3, cont5]);
                expect(columnContext.getPageFloatContinuationsDeferredToNext("bar")).toEqual([cont2, cont4, cont6]);
            });

            it("returns all PageFLoatContinuations deferred to the next fragmentainer in order of page, region and column when the context does not have a flow name and no flow name is specified as an argument", function() {
                expect(pageContext.getPageFloatContinuationsDeferredToNext()).toEqual([cont1, cont2]);
            });
        });

        describe("#finish", function() {
            var context, float1, cont1, fragment1, float2, fragment2, float3, cont3, float4, cont4;
            beforeEach(function() {
                context = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, null, null);
                spyOn(context, "isAnchorAlreadyAppeared");
                spyOn(context, "removePageFloatFragment");
                float1 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                context.addPageFloat(float1);
                fragment1 = new PageFloatFragment(float1, {});
                context.addPageFloatFragment(fragment1);
                cont1 = new PageFloatContinuation(float1, {}, "foo");
                float2 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                context.addPageFloat(float2);
                fragment2 = new PageFloatFragment(float2, {});
                context.addPageFloatFragment(fragment2);
                float3 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                cont3 = new PageFloatContinuation(float3, {}, "bar");
                context.addPageFloat(float3);
                float4 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                context.addPageFloat(float4);
                cont4 = new PageFloatContinuation(float4, {}, "baz");
                context.floatsDeferredFromPrevious = [cont1, cont3, cont4];
                context.floatsDeferredToNext = [cont3];
            });

            it("Removes and forbids the last fragment whose anchor have not appeared", function() {
                context.isAnchorAlreadyAppeared.and.returnValue(false);
                context.finish();

                expect(context.removePageFloatFragment).toHaveBeenCalledWith(fragment2);
                expect(context.removePageFloatFragment).not.toHaveBeenCalledWith(fragment1);
                expect(context.isForbidden(float2)).toBe(true);
                expect(context.isForbidden(float1)).not.toBe(true);
                expect(context.floatsDeferredToNext).toEqual([cont3]);
            });

            it("Removes the last fragment whose anchor have not appeared", function() {
                context.isAnchorAlreadyAppeared.and.callFake(function(f) {
                    return f === fragment2.pageFloatId;
                });
                context.finish();

                expect(context.removePageFloatFragment).toHaveBeenCalledWith(fragment1);
                expect(context.removePageFloatFragment).not.toHaveBeenCalledWith(fragment2);
                expect(context.isForbidden(float1)).toBe(true);
                expect(context.isForbidden(float2)).not.toBe(true);
                expect(context.floatsDeferredToNext).toEqual([cont3]);
            });

            it("Removes floats deferred to next fragmentainers if their anchors have not appeared", function() {
                var float5 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                context.addPageFloat(float5);
                var cont5 = new PageFloatContinuation(float5, {}, "aaa");
                context.floatsDeferredToNext = [cont3, cont5];
                context.isAnchorAlreadyAppeared.and.callFake(function(id) {
                    return id === float1.getId() || id === float2.getId();
                });
                context.finish();

                expect(context.removePageFloatFragment).not.toHaveBeenCalled();
                expect(context.floatsDeferredToNext).toEqual([cont3, cont4]);
            });

            it("Transfer floats deferred from previous fragmentainers and not laid out yet if all anchor view nodes of the float fragments have already appeared", function() {
                expect(context.findPageFloatFragment(float1)).toBe(fragment1);
                expect(context.findPageFloatFragment(float2)).toBe(fragment2);

                context.isAnchorAlreadyAppeared.and.returnValue(true);
                context.finish();

                expect(context.removePageFloatFragment).not.toHaveBeenCalled();
                expect(context.floatsDeferredToNext).toEqual([cont3, cont4]);
            });
        });

        describe("#invalidate", function() {
            var container, context;
            beforeEach(function() {
                container = { clear: jasmine.createSpy("clear") };
                context = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, container, null, null, null);
            });

            it("invalidate the container", function() {
                expect(context.isInvalidated()).toBe(false);

                context.invalidate();

                expect(container.clear).toHaveBeenCalled();
                expect(context.isInvalidated()).toBe(true);
            });

            it("removes all registered anchor view nodes", function() {
                var float = new PageFloat({}, FloatReference.PAGE, "block-start");
                context.addPageFloat(float);
                var anchorViewNode = {};
                context.registerPageFloatAnchor(float, anchorViewNode);

                expect(context.floatAnchors[float.getId()]).toBe(anchorViewNode);

                context.invalidate();

                expect(Object.keys(context.floatAnchors).length).toBe(0);
            });

            it("clears children", function() {
                var child = new PageFloatLayoutContext(context, FloatReference.REGION, null, null, null, null);

                expect(context.children).toEqual([child]);

                context.invalidate();

                expect(context.children).toEqual([]);
            });
        });

        describe("#isInvalidated", function() {
            function container() {
                return { clear: jasmine.createSpy("clear") };
            }

            it("returns true if one of its ancestors is invalidated", function() {
                var pageContext = new PageFloatLayoutContext(rootContext, FloatReference.PAGE, container(), null, null, null);
                var regionContext = new PageFloatLayoutContext(pageContext, FloatReference.REGION, container(), null, null, null);
                var columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, container(), null, null, null);

                expect(columnContext.isInvalidated()).toBe(false);
                expect(regionContext.isInvalidated()).toBe(false);
                expect(pageContext.isInvalidated()).toBe(false);

                columnContext.invalidate();

                expect(columnContext.isInvalidated()).toBe(true);
                expect(regionContext.isInvalidated()).toBe(false);
                expect(pageContext.isInvalidated()).toBe(false);

                columnContext.validate();

                expect(columnContext.isInvalidated()).toBe(false);

                regionContext.invalidate();

                expect(columnContext.isInvalidated()).toBe(true);
                expect(regionContext.isInvalidated()).toBe(true);
                expect(pageContext.isInvalidated()).toBe(false);

                regionContext.validate();

                expect(regionContext.isInvalidated()).toBe(false);

                pageContext.invalidate();

                expect(columnContext.isInvalidated()).toBe(true);
                expect(regionContext.isInvalidated()).toBe(true);
                expect(pageContext.isInvalidated()).toBe(true);
            });
        });

        describe("#setFloatAreaDimensions", function() {
            var Size = vivliostyle.sizing.Size;
            var fitContentInlineSize, container, area;
            beforeEach(function() {
                fitContentInlineSize = 100;
                var sizeObj = {};
                sizeObj[Size.FIT_CONTENT_INLINE_SIZE] = fitContentInlineSize;
                spyOn(vivliostyle.sizing, "getSize").and.returnValue(sizeObj);
                container = {
                    top: 2,
                    left: 3,
                    width: 111,
                    height: 222
                };
                area = {
                    vertical: false,
                    computedBlockSize: 77,
                    getBoxDir: function() { return this.vertical ? -1 : 1; },
                    setBlockPosition: jasmine.createSpy("setBlockPosition"),
                    setInlinePosition: jasmine.createSpy("setInlinePosition")
                };
            });

            it("set position in block direction on the area for block-start float", function() {
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.horizontal_tb, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.top, area.computedBlockSize);
            });

            it("set position in block direction on the vertical area for block-start float", function() {
                area.vertical = true;
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.vertical_rl, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.left + container.width, area.computedBlockSize);
            });

            it("set position in block direction on the area for block-end float", function() {
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.horizontal_tb, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "block-end");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.top + container.height - area.computedBlockSize, area.computedBlockSize);
            });

            it("set position in block direction on the vertical area for block-end float", function() {
                area.vertical = true;
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.vertical_rl, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "block-end");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.left + area.computedBlockSize, area.computedBlockSize);
            });

            it("set position in block and inline directions on the area for inline-start float", function() {
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.horizontal_tb, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "inline-start");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.top, area.computedBlockSize);
                expect(area.setInlinePosition).toHaveBeenCalledWith(
                    container.left, fitContentInlineSize);
            });

            it("set position in block and inline directions on the vertical area for inline-start float", function() {
                area.vertical = true;
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.vertical_rl, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "inline-start");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.left + container.width, area.computedBlockSize);
                expect(area.setInlinePosition).toHaveBeenCalledWith(
                    container.top, fitContentInlineSize);
            });

            it("set position in block and inline directions on the area for inline-end float", function() {
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.horizontal_tb, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "inline-start");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.top, area.computedBlockSize);
                expect(area.setInlinePosition).toHaveBeenCalledWith(
                    container.left, fitContentInlineSize);
            });

            it("set position in block and inline directions on the vertical area for inline-end float", function() {
                area.vertical = true;
                var columnContext = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, adapt.css.ident.vertical_rl, adapt.css.ident.ltr);
                columnContext.setContainer(container);
                var float = new PageFloat({}, FloatReference.COLUMN, "inline-end");
                columnContext.setFloatAreaDimensions(area, float);

                expect(area.setBlockPosition).toHaveBeenCalledWith(
                    container.left + area.computedBlockSize, area.computedBlockSize);
                expect(area.setInlinePosition).toHaveBeenCalledWith(
                    container.top + container.height - fitContentInlineSize, fitContentInlineSize);
            });
        });

        describe("#getFloatFragmentExclusions", function() {
            it("returns an array of exclusions of PageFloatFragments", function() {
                var context = new PageFloatLayoutContext(rootContext, FloatReference.COLUMN, null, null, null, null);

                var float1 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                context.addPageFloat(float1);
                var shape1 = { foo: "shape1" };
                var area1 = { getOuterShape: jasmine.createSpy("getOuterShape").and.returnValue(shape1) };
                var fragment1 = new PageFloatFragment(float1, area1);
                context.addPageFloatFragment(fragment1);

                var float2 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                context.addPageFloat(float2);
                var shape2 = { foo: "shape2" };
                var area2 = { getOuterShape: jasmine.createSpy("getOuterShape").and.returnValue(shape2) };
                var fragment2 = new PageFloatFragment(float2, area2);
                context.addPageFloatFragment(fragment2);

                expect(context.getFloatFragmentExclusions()).toEqual([shape1, shape2]);
            });

            it("returns an array of exclusions of PageFloatFragments, including those registered in the parent context", function() {
                var regionContext = new PageFloatLayoutContext(rootContext, FloatReference.REGION, null, null, null, null);
                var columnContext = new PageFloatLayoutContext(regionContext, FloatReference.COLUMN, null, null, null, null);

                var float1 = new PageFloat({}, FloatReference.REGION, "block-start");
                regionContext.addPageFloat(float1);
                var shape1 = { foo: "shape1" };
                var area1 = { getOuterShape: jasmine.createSpy("getOuterShape").and.returnValue(shape1) };
                var fragment1 = new PageFloatFragment(float1, area1);
                regionContext.addPageFloatFragment(fragment1);

                var float2 = new PageFloat({}, FloatReference.COLUMN, "block-start");
                columnContext.addPageFloat(float2);
                var shape2 = { foo: "shape2" };
                var area2 = { getOuterShape: jasmine.createSpy("getOuterShape").and.returnValue(shape2) };
                var fragment2 = new PageFloatFragment(float2, area2);
                columnContext.addPageFloatFragment(fragment2);

                expect(columnContext.getFloatFragmentExclusions()).toEqual([shape1, shape2]);
            });
        });
    });
});