(function ($, _, B) {
    let wcftxtas = {
        admin: {
            views: {

            },
        },
    };

    wcftxtas.admin.views.AddressConfigFieldView = B.View.extend({
        el: null,
        field: null,
        baseName: null,

        initialize: function (args) {
            this.field = args.field;
            this.baseName = args.baseName;
        },

        addButtonTemplate: _.template(''),

        render: function () {
            let $el = $(this.el);

            $el.html();

            _.forEach(this.field, _.bind(function (item, index) {
                item.id = index;
                let $item = $('<addressSubfield></addressSubfield>');

                let subview = this.createSubfieldView({el: $item.get(0), subfield: item, baseName: this.baseName, id: index});
                this.on('click', _.bind(this.addRow, this), this);

                $el.append($item);
                subview.render();
            }, this));
        },

        addRow: function (data) {
            this.field.push(data);
            this.render();
        },

        createSubfieldView: function (args) {
            args.parent = this;
            return new wcftxtas.admin.views.AddressConfigSubfieldView(args);
        },
    });

    wcftxtas.admin.views.AddressConfigSubfieldView = B.View.extend({
        el: null,
        parent: null,

        initialize: function (args) {
            this.parent = args.parent;
            this.subfield = args.subfield;
            this.baseName= args.baseName;
        },

        template: _.template('<div class="subfield-wrapper">' +
            '<div class="subfield">' +
            '   <label class="sub-label" for="">Label</label>' +
            '   <input class="sub-field" type="text" id="" title="Label" name="<%=baseName %>[<%= id %>][label]" value="<%=label %>" />' +
            '</div>' +
            '<div class="subfield">' +
            '    <label class="sub-label" for="">Mapping</label>' +
            '    <textarea class="sub-field" id="" name="<%=baseName %>[<%= id %>][mapping]" title="Mapping"><%=mapping %></textarea>' +
            '</div>' +
            '<div class="subfield">' +
            '    <label class="sub-label" for="">Placeholder</label>' +
            '    <textarea class="sub-field" id="" name="<%=baseName %>[<%= id %>][placeholder]" title="Placeholder"><%=placeholder %></textarea>' +
            '</div>' +
            '</div>'),

        render: function () {
            let subfield = this.subfield;
            subfield.baseName = this.baseName;
            subfield.mapping = JSON.stringify(subfield.mapping, null, 2);
            subfield.id = this.id;
            let $content = $(this.template(subfield));

            this.$el.replaceWith($content);
            this.setElement($content.get(0));
        }
    });

    window.wcftxtas = wcftxtas;
}(jQuery, _, Backbone));
