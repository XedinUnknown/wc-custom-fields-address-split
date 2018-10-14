(function ($, options) {
    var AddressSplitter = function () {

        let sepChars = '\\n,';
        let s = `[${sepChars}]`;
        let ns = `[^${sepChars}]`;

        this.expression = new RegExp(
                `(${ns}+)${s}+` + // Name
                `(${ns}+(?:${s}+))?` + // Optional second line
                `(${ns}+?)` + // Street address (lazy)
                `([\\d]+[ ]?${ns}*)?` + // Optional house number
                `${s}+` +
                `([\\d ]+)` + // ZIP
                `((?: )?${ns}*)?` // City
            ,
            'mu'
        );

        this.mapData = function (values, map) {
            let data = {};
            for (let i in map) {
                let value = values[i];
                value = typeof value === 'string'
                    ? value.trim()
                    : value;
                data[map[i]] = value;
            }

            return data;
        };

        this.splitAddress = function (address) {
            let expr = this.expression;
            let matches = expr.exec(address);

            if (!matches) {
                throw {
                    'message': 'Address could not be parsed',
                    'address': address,
                    'expression': expr,
                };
            }

            let dataIndexMap = [
                'match',
                'name',
                'secondLine',
                'street',
                'residence',
                'zip',
                'city',
            ];

            // create data from index map
            data = this.mapData(matches, dataIndexMap);
            delete data.match;

            return data;
        };
    };

    var CustomFieldSelector = function (rootEl, fieldClass) {
        this.rootEl = rootEl;
        this.fieldClass = fieldClass;

        this.selectField =  function (label) {
            return $(rootEl).find('.' + this.fieldClass).filter(function (index) {
                let $el = $(this);
                let fieldLabel = $el.parent().contents().get(0).nodeValue.trim();

                return fieldLabel === label;
            });
        };
    };

    /**
     * @param {AddressSplitter} splitter
     * @param {CustomFieldSelector} selector
     * @constructor
     */
    var FieldSplitterUi = function (splitter, selector) {
        this.splitter = splitter;
        this.selector = selector;

        this.splitField = function (el, fieldMap) {
            let content = $(el).val();
            let data = this.splitter.splitAddress(content);

            for (let i in fieldMap) {
                let $el = this.selector.selectField(fieldMap[i]);
                $el.val(data[i]);
            }
        };
    };

    var AddressFieldUi = function (fieldSplitterUi, container) {
        this.fieldSplitterUi = fieldSplitterUi;
        this.container = container;

        this.createField = function (id, label, fieldMap) {
            $container = $(this.container);
            $senderField = $(`<textarea class="wcftxtas-address-field wcftxtas-address-field--${id}" id="wcftxtas-address-field-${id}"></textarea>`).css({
                margin: 0,
            });
            $wrapper = $('<p><label></label></p>');
            $senderField.wrap($wrapper);
            $senderField.before(label);
            $notification = $('<span class="address-notice">&nbsp;</span>').css({
                opacity: 0,
                color: 'red',
                'font-size': '0.8em',
            });
            $senderBlock = $senderField.closest('p');
            $senderBlock.append($notification);

            let me = this;
            $senderField.on('blur', (function($notification){
                return function (e) {
                    me.fieldSplitterUi.splitField(e.target, fieldMap);
                    me.animateNotice($notification, 'Please check if the fields were filled in correctly');
                };
            }($notification)));

            $container.prepend($senderBlock);

            return $senderField;
        };

        this.animateNotice = function (notice, text) {
            $notice = $(notice);
            if (parseInt($notice.css('opacity')) !== 0) {
                return;
            }

            // Set the label
            $notice.html(text);

            // Fade in and out
            $notice.animate({
                opacity: 1,
            },{
                duration: 100,
                queue: true,
            })
            .delay(3000)
            .animate({
                opacity: 0
            },{
                duration: 100,
                queue: true,
            });
        };
    };

    $(function () {
        let fieldMap = options.fieldMap;
        if (!fieldMap) {
            console.warn('Address splitting could not read the field map and will be disabled');
            return;
        }

        $container = $('#wcft_modal_wrap .wcft_modal_form > div');


        let splitter = new AddressSplitter();
        let selector = new CustomFieldSelector($container, 'wcft_field');
        let splitterUi = new FieldSplitterUi(splitter, selector);
        let fieldUi = new AddressFieldUi(splitterUi, $container.get(0));

        for (i in fieldMap.reverse()) { // Reverse because we are appending one by one
            if (!(fieldMap[i] && typeof fieldMap[i] === 'object')) {
                console.warn(`Address splitting disabled for field "${i}" because it could not be read`);
                continue;
            }

            fieldUi.createField(i, fieldMap[i].label, fieldMap[i].mapping);
        }
    });
}(jQuery, wcftxtasOptions));
