(function ($, _, B) {
    let wcftxtas = {
        admin: {
            views: {

            },
        },
    };

    wcftxtas.admin.views.AddressConfigFieldView = B.View.extend({
        template: null,
        el: null,
        field: null,
        baseName: null,

        initialize: function (args) {
            // this.template = this.getTemplateHtml(templateId);;
            this.field = args.field;
            this.baseName = args.baseName;
        },

        getTemplateHtml: function (templateId) {
            if (!templateId) {
                throw {
                    message: 'Template ID is required',
                };
            }

            let $template = $('#' + templateId);
            if (!$template.size()) {
                throw {
                    message: `Could not find template element with ID "${templateId}"`,
                };
            }

            this.template = _.template($template.first().html());
        },

        addButtonTemplate: _.template(''),

        render: function () {
            this.$el.html('');

            _.forEach(this.field, _.bind(function (item, index) {
                item = JSON.parse(JSON.stringify(item));
                item.id = index;
                item.label = item.label || '';
                item.mapping = item.mapping || '';
                item.placeholder = item.placeholder || '';

                let $item = $('<addressSubfield></addressSubfield>');

                let subview = this.createSubfieldView({el: $item.get(0), subfield: item, baseName: this.baseName, id: index});
                subview.on('remove', _.bind(function (view) {
                    this.field.splice(view.id, 1);
                    this.render();
                }, this));

                subview.on('changed', _.bind(function (view, data) {
                    this.field.splice(view.id, 1, data);
                }, this));

                this.$el.append($item);
                subview.render();
            }, this));

            let btnItem = $('<addButton></addButton>');
            this.$el.append(btnItem);
            let addButtonView = this.createButtonView({el: btnItem.get(0)});
            addButtonView.on('clicked', _.bind(function (e) {
                this.addRow({});
            }, this), this);
            addButtonView.render();
        },

        addRow: function (data) {
            this.field.push(data);
            this.render();
        },

        createSubfieldView: function (args) {
            args.parent = this;
            return new wcftxtas.admin.views.AddressConfigSubfieldView(args);
        },

        createButtonView: function(args) {
            args.parent = this;
            return new wcftxtas.admin.views.AddressConfigAddButtonView(args);
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
            '   <input class="sub-field wcftxtas-address-label" type="text" id="" title="Label" name="<%=baseName %>[<%= id %>][label]" value="<%=label %>" />' +
            '</div>' +
            '<div class="subfield">' +
            '    <label class="sub-label" for="">Mapping</label>' +
            '    <textarea class="sub-field wcftxtas-address-mapping" id="" name="<%=baseName %>[<%= id %>][mapping]" title="Mapping"><%=mapping %></textarea>' +
            '</div>' +
            '<div class="subfield">' +
            '    <label class="sub-label" for="">Placeholder</label>' +
            '    <textarea class="sub-field wcftxtas-address-placeholder" id="" name="<%=baseName %>[<%= id %>][placeholder]" title="Placeholder"><%=placeholder %></textarea>' +
            '</div>' +
            '</div>'),

        render: function () {
            let subfield = this.subfield;
            subfield.baseName = this.baseName;
            subfield.mapping = !(typeof subfield.mapping === 'string' && subfield.mapping.length === 0)
                ? JSON.stringify(subfield.mapping, null, 2)
                : '';
            subfield.id = this.id;
            let $content = $(this.template(subfield));

            let $button = $('<removeButton></removeButton>');
            let buttonView = this.createRemoveButton({
                el: $button.get(0),
            });
            buttonView.on('clicked', _.bind(function (e) {
                this.trigger('remove', this);
            }, this));
            $content.prepend($button);
            buttonView.render();

            this.$el.replaceWith($content);
            this.setElement($content.get(0));

            $fields = $('input, textarea', this.el).on('change', _.bind(function () {
                this.trigger('changed', this, this.collectData());
            }, this));
        },

        collectData: function () {
            let label = $('.wcftxtas-address-label', this.$el).val();
            let placeholder = $('.wcftxtas-address-placeholder', this.$el).val();
            let $mapping = $('.wcftxtas-address-mapping', this.$el);
            let mapping = $mapping.val();
            try {
                mapping = JSON.parse(mapping);
                $mapping.css({'border-color': 'lightgrey'});
            } catch (ex) {
                mapping = '';
                $mapping.css({'border-color': 'red'});
            }

            return {
                label: label,
                mapping: mapping,
                placeholder: placeholder,
            };
        },

        createRemoveButton: function (args) {
            args.parent = this;
            return new wcftxtas.admin.views.AddressConfigRemoveButtonView(args);
        },
    });

    wcftxtas.admin.views.AddressConfigAddButtonView = B.View.extend({
        el: null,

        template: _.template('<button>Add Address Field</button>'),

        initialize: function (args) {
        },

        render: function () {
            let $content = $(this.template());

            this.$el.replaceWith($content);
            this.setElement($content.get(0));

            $content.on('click', _.bind(function (e) {
                this.trigger('clicked', e);
            }, this));
        }
    });

    wcftxtas.admin.views.AddressConfigRemoveButtonView = B.View.extend({
        el: null,

        template: _.template('<span class="wcftxtas-admin-address-remove">Remove</span>'),

        initialize: function (args) {
        },

        render: function () {
            let $content = $(this.template());

            this.$el.replaceWith($content);
            this.setElement($content.get(0));

            $content.on('click', _.bind(function (e) {
                this.trigger('clicked', e);
            }, this));
        }
    });

    window.wcftxtas = wcftxtas;
}(jQuery, _, Backbone));
