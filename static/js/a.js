/*! For license information please see index.js.LICENSE.txt */
!function(t, e) {
    if ("object" == typeof exports && "object" == typeof module)
        module.exports = e(require("blockly/core"));
    else if ("function" == typeof define && define.amd)
        define(["blockly/core"], e);
    else {
        var o = "object" == typeof exports ? e(require("blockly/core")) : e(t.Blockly);
        for (var s in o)
            ("object" == typeof exports ? exports : t)[s] = o[s]
    }
}(this, (t => ( () => {
    "use strict";
    var e = {
        370: e => {
            e.exports = t
        }
    }
      , o = {};
    function s(t) {
        var i = o[t];
        if (void 0 !== i)
            return i.exports;
        var r = o[t] = {
            exports: {}
        };
        return e[t](r, r.exports, s),
        r.exports
    }
    s.d = (t, e) => {
        for (var o in e)
            s.o(e, o) && !s.o(t, o) && Object.defineProperty(t, o, {
                enumerable: !0,
                get: e[o]
            })
    }
    ,
    s.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e),
    s.r = t => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(t, "__esModule", {
            value: !0
        })
    }
    ;
    var i = {};
    s.r(i),
    s.d(i, {
        ContinuousCategory: () => l,
        ContinuousFlyout: () => a,
        ContinuousMetrics: () => h,
        ContinuousToolbox: () => n
    });
    var r = s(370);
    class l extends r.ToolboxCategory {
        constructor(t, e) {
            super(t, e)
        }
        createLabelDom_(t) {
            const e = document.createElement("div");
            return e.setAttribute("id", this.getId() + ".label"),
            e.textContent = t,
            e.classList.add(this.cssConfig_.label),
            e
        }
        createIconDom_() {
            const t = document.createElement("div");
            return t.classList.add("categoryBubble"),
            t.style.backgroundColor = this.colour_,
            t
        }
        addColourBorder_() {}
        setSelected(t) {
            t ? (this.rowDiv_.style.backgroundColor = "gray",
            r.utils.dom.addClass(this.rowDiv_, this.cssConfig_.selected)) : (this.rowDiv_.style.backgroundColor = "",
            r.utils.dom.removeClass(this.rowDiv_, this.cssConfig_.selected)),
            r.utils.aria.setState(this.htmlDiv_, r.utils.aria.State.SELECTED, t)
        }
    }
    r.registry.register(r.registry.Type.TOOLBOX_ITEM, r.ToolboxCategory.registrationName, l, !0);
    class n extends r.Toolbox {
        constructor(t) {
            super(t)
        }
        init() {
            super.init();
            const t = this.getFlyout();
            t.show(this.getInitialFlyoutContents_()),
            t.recordScrollPositions(),
            this.workspace_.addChangeListener((t => {
                t.type !== r.Events.BLOCK_CREATE && t.type !== r.Events.BLOCK_DELETE || this.refreshSelection()
            }
            ))
        }
        getFlyout() {
            return super.getFlyout()
        }
        getInitialFlyoutContents_() {
            let t = [];
            for (const e of this.contents_)
                if (e instanceof r.ToolboxCategory) {
                    t.push({
                        kind: "LABEL",
                        text: e.getName()
                    });
                    let o = e.getContents();
                    "string" == typeof o && (o = {
                        custom: o,
                        kind: "CATEGORY"
                    }),
                    t = t.concat(o)
                }
            return t
        }
        refreshSelection() {
            this.getFlyout().show(this.getInitialFlyoutContents_())
        }
        updateFlyout_(t, e) {
            if (e) {
                const t = this.getFlyout().getCategoryScrollPosition(e.name_).y;
                this.getFlyout().scrollTo(t)
            }
        }
        shouldDeselectItem_(t, e) {
            return t && t !== e
        }
        getCategoryByName(t) {
            return this.contents_.find((e => e instanceof r.ToolboxCategory && e.isSelectable() && t === e.getName())) || null
        }
        selectCategoryByName(t) {
            const e = this.getCategoryByName(t);
            if (!e)
                return;
            const o = this.selectedItem_;
            this.shouldDeselectItem_(o, e) && this.deselectItem_(o),
            this.shouldSelectItem_(o, e) && this.selectItem_(o, e)
        }
        getClientRect() {
            const t = this.getFlyout();
            return t && !t.autoClose ? t.getClientRect() : super.getClientRect()
        }
    }
    r.Css.register("\n.categoryBubble {\n  margin: 0 auto 0.125rem;\n  border-radius: 100%;\n  border: 1px solid;\n  width: 1.25rem;\n  height: 1.25rem;\n}\n.blocklyTreeRow {\n  height: initial;\n  padding: 3px 0;\n}\n.blocklyTreeRowContentContainer {\n  display: flex;\n  flex-direction: column;\n}\n.blocklyTreeLabel {\n  margin: auto;\n}\n");
    class c extends r.FlyoutMetricsManager {
        constructor(t, e) {
            super(t, e)
        }
        getScrollMetrics(t=void 0, e=void 0, o=void 0) {
            const s = super.getScrollMetrics(t, e, o)
              , i = o || this.getContentMetrics(t)
              , r = e || this.getViewMetrics(t);
            return s && (s.height += this.flyout_.calculateBottomPadding(i, r)),
            s
        }
    }
    class a extends r.VerticalFlyout {
        constructor(t) {
            super(t),
            this.scrollPositions = [],
            this.scrollTarget = null,
            this.scrollAnimationFraction = .3,
            this.recyclingEnabled_ = !0,
            this.workspace_.setMetricsManager(new c(this.workspace_,this)),
            this.workspace_.addChangeListener((t => {
                t.type === r.Events.VIEWPORT_CHANGE && this.selectCategoryByScrollPosition_(-this.workspace_.scrollY)
            }
            )),
            this.autoClose = !1
        }
        getParentToolbox_() {
            return this.targetWorkspace.getToolbox()
        }
        recordScrollPositions() {
            this.scrollPositions = [];
            const t = this.buttons_.filter((t => t.isLabel() && this.getParentToolbox_().getCategoryByName(t.getButtonText())));
            for (const [e,o] of t.entries())
                if (o.isLabel()) {
                    const t = o.getPosition()
                      , s = new r.utils.Coordinate(t.x,t.y - this.labelGaps[e]);
                    this.scrollPositions.push({
                        name: o.getButtonText(),
                        position: s
                    })
                }
        }
        getCategoryScrollPosition(t) {
            for (const e of this.scrollPositions)
                if (e.name === t)
                    return e.position;
            return console.warn(`Scroll position not recorded for category ${t}`),
            null
        }
        selectCategoryByScrollPosition_(t) {
            if (null !== this.scrollTarget)
                return;
            const e = Math.round(t / this.workspace_.scale);
            for (let t = this.scrollPositions.length - 1; t >= 0; t--) {
                const o = this.scrollPositions[t];
                if (e >= o.position.y)
                    return void this.getParentToolbox_().selectCategoryByName(o.name)
            }
        }
        scrollTo(t) {
            const e = this.workspace_.getMetrics();
            this.scrollTarget = Math.min(t * this.workspace_.scale, e.scrollHeight - e.viewHeight),
            this.stepScrollAnimation_()
        }
        stepScrollAnimation_() {
            if (null === this.scrollTarget)
                return;
            const t = -this.workspace_.scrollY
              , e = this.scrollTarget - t;
            if (Math.abs(e) < 1)
                return this.workspace_.scrollbar.setY(this.scrollTarget),
                void (this.scrollTarget = null);
            this.workspace_.scrollbar.setY(t + e * this.scrollAnimationFraction),
            requestAnimationFrame(this.stepScrollAnimation_.bind(this))
        }
        calculateBottomPadding(t, e) {
            if (this.scrollPositions.length > 0) {
                const o = this.scrollPositions[this.scrollPositions.length - 1].position.y * this.workspace_.scale
                  , s = t.height - o;
                if (s < e.height)
                    return e.height - s
            }
            return 0
        }
        getX() {
            return this.isVisible() && this.targetWorkspace.toolboxPosition === this.toolboxPosition_ && this.targetWorkspace.getToolbox() && this.toolboxPosition_ !== r.utils.toolbox.Position.LEFT ? this.targetWorkspace.getMetricsManager().getViewMetrics().width : super.getX()
        }
        show(t) {
            super.show(t),
            this.recordScrollPositions(),
            this.workspace_.resizeContents(),
            this.getParentToolbox_().getSelectedItem() || this.selectCategoryByScrollPosition_(0)
        }
        blockIsRecyclable_(t) {
            if (!this.recyclingEnabled_)
                return !1;
            if (t.mutationToDom && t.domToMutation)
                return !1;
            if (!t.isEnabled())
                return !1;
            for (const e of t.inputList) {
                for (const t of e.fieldRow) {
                    if (t.referencesVariables())
                        return !1;
                    if (t instanceof r.FieldDropdown && t.isOptionListDynamic())
                        return !1
                }
                if (e.connection) {
                    const t = e.connection.targetBlock();
                    if (t && !this.blockIsRecyclable_(t))
                        return !1
                }
            }
            return !0
        }
        setBlockIsRecyclable(t) {
            this.blockIsRecyclable_ = t
        }
        setRecyclingEnabled(t) {
            this.recyclingEnabled_ = t
        }
        layout_(t, e) {
            super.layout_(t, e),
            this.labelGaps = [];
            for (const [o,s] of t.entries())
                "button" === s.type && s.button.isLabel() && this.labelGaps.push(e[o - 1] ?? this.MARGIN)
        }
    }
    class h extends r.MetricsManager {
        constructor(t) {
            super(t)
        }
        getViewMetrics(t=void 0) {
            const e = t ? this.workspace_.scale : 1
              , o = this.getSvgMetrics()
              , s = this.getToolboxMetrics()
              , i = this.getFlyoutMetrics(!1)
              , l = s.position;
            return this.workspace_.getToolbox() && (l == r.TOOLBOX_AT_TOP || l == r.TOOLBOX_AT_BOTTOM ? o.height -= s.height + i.height : l != r.TOOLBOX_AT_LEFT && l != r.TOOLBOX_AT_RIGHT || (o.width -= s.width + i.width)),
            {
                height: o.height / e,
                width: o.width / e,
                top: -this.workspace_.scrollY / e,
                left: -this.workspace_.scrollX / e
            }
        }
        getAbsoluteMetrics() {
            const t = this.getToolboxMetrics()
              , e = this.getFlyoutMetrics(!1)
              , o = t.position;
            let s = 0;
            this.workspace_.getToolbox() && o == r.TOOLBOX_AT_LEFT && (s = t.width + e.width);
            let i = 0;
            return this.workspace_.getToolbox() && o == r.TOOLBOX_AT_TOP && (i = t.height + e.height),
            {
                top: i,
                left: s
            }
        }
    }
    return r.registry.register(r.registry.Type.METRICS_MANAGER, "CustomMetricsManager", h),
    i
}
)()));
//# sourceMappingURL=index.js.map
