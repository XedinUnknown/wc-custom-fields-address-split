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

    $(function () {
        let fieldMap = options.fieldMap;
        if (!fieldMap) {
            console.warn('Address splitting could not read the field map and will be disabled');
        }

        $container = $('#wcft_modal_wrap .wcft_modal_form > div');

        $senderField = $('<textarea class="wcftxtas-sender-address"></textarea>');
        $wrapper = $('<p><label></label></p>');
        $senderField.wrap($wrapper);
        $senderField.before('Sender Address');
        $senderBlock = $senderField.closest('p');

        $container.prepend($senderBlock);

        let splitter = new AddressSplitter();
        let selector = new CustomFieldSelector($container, 'wcft_field');

        $senderField.on('blur', function (e) {
            let $el = $(e.target);
            let content = $el.val();

            let data = splitter.splitAddress(content);
            console.log(data);

            for (let i in fieldMap) {
                let $el = selector.selectField(fieldMap[i]);
                $el.val(data[i]);
            }
        });

    });
}(jQuery, wcftxtasOptions));
