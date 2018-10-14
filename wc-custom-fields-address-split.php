<?php
/**
 * Plugin Name: WooCommerce Custom Fields TXT - Address Split Addon
 * Version: 0.1
 * Description: Allows adding sender and receiver address fields to the popup generated by the "WooCommerce Custom Fields TXT" plugin, which will be split into separate fields according to the mapping.
 * Plugin URI: https://github.com/XedinUnknown/wc-custom-fields-address-split
 * Author: Anton Ukhanev
 * Author URI: https://github.com/XedinUnknown
 * Text Domain: wcftxtas
 * Requires PHP: 5.4
 */

namespace XedinUnknown\WC_CFTXT_Address_Split;

class Plugin {
    protected $baseDir;
    protected $baseUrl;
    protected $version = '0.1';

    const MAPPING_FIELD_NAME = 'wcftxtas_field_mapping';

    public function __construct( $baseDir, $baseUrl )
    {
        $this->baseDir = $baseDir;
        $this->baseUrl = $baseUrl;
    }

    public function hook() {
        add_filter( 'woocommerce_product_data_panels', function () {
            echo $this->get_tab_panel_output();
        } );
        add_filter( 'woocommerce_product_data_tabs', function ( $tabs ) {
            $tabs['wcftxtas'] = $this->get_tab();

            return $tabs;
        } );
        add_action( 'woocommerce_process_product_meta_simple', function ( $post_id ) {
            $this->save_tab_data( $post_id );
        } );
        add_action( 'init', function () {
            $this->register_assets();
        } );
        add_action( 'wp_enqueue_scripts', function () {
            if (!function_exists('is_product') || !is_product()) {
                return false;
            }

            $product = wc_get_product( get_post()->ID );
            $product_id = $product->get_id();

            $is_enabled = get_post_meta( $product_id, '_wcftxtas_enabled', true ) === 'yes';
            if (!$is_enabled) {
                return false;
            }

            $is_custom_fields_enabled = get_post_meta( $product_id, '_enable_wcft', true ) === 'yes';
            if (!$is_custom_fields_enabled) {
                return false;
            }

            wp_enqueue_script( 'wcftxtas-address-fields-js');
            wp_localize_script( 'wcftxtas-address-fields-js', 'wcftxtasOptions', array(
                'fieldMap'            => $this->get_field_map( $product_id ),
            ) );
        } );
    }

    protected function register_assets() {
        wp_register_script('wcftxtas-address-fields-js', "{$this->baseUrl}/assets/js/address-fields.js", ['jquery', 'underscore'], $this->version, false);
    }

    protected function get_tab_panel_output() {
        $post = get_post();
        ob_start();
        ?>
        <div id="wcftxtas_tab_data" class="panel woocommerce_options_panel">
            <span class="options_group">
                <?php
                // Enabled/disabled
                woocommerce_wp_checkbox(
                    array(
                        'id'            => '_wcftxtas_enabled',
                        'wrapper_class' => 'show_if_simple',
                        'label'         => __( 'Enable address splitting', 'wcftxtas' ),
                    )
                );
                ?>

                <div class="form-field _wcftxtas_field_mapping_field">
                    <label><?php echo esc_html(__('Field Mapping')) ?></label>
                    <div class="subfield-wrapper">
                <?php
                    $mapping_field_name = static::MAPPING_FIELD_NAME;
                    $field_data = $this->get_json_field($post->ID, $mapping_field_name);
                    $addressFields = array(
                        (object) array(
                            'id'            => 'sender',
                            'label'         => __( 'Sender', 'wcftxtas' ),
                        ),
                        (object) array(
                            'id'            => 'receiver',
                            'label'         => __( 'Receiver', 'wcftxtas' ),
                        ),
                    );

                    foreach ($addressFields as $_idx => $_field) {
                        $data = isset($field_data[$_idx]) ? $field_data[$_idx] : null;
                        $caption = isset($data) && isset($data->label) ? $data->label : null;
                        $mapping = isset($data) && isset($data->mapping) ? json_encode($data->mapping, JSON_PRETTY_PRINT) : null;

                        $field_id_label = "_wcftxtas_field_mapping_field_{$_field->id}_label";
                        $field_id_mapping = "_wcftxtas_field_mapping_field_{$_field->id}_mapping";
                        $field_caption_label = $_field->label . ' - Label';
                        $field_caption_mapping = $_field->label . ' - Mapping';
                        ?>
                        <label class="sub-label" for="<?php echo $field_id_label ?>"><?php echo esc_html($field_caption_label) ?></label>
                        <input class="sub-field" type="text" id="<?php echo esc_attr($field_id_label) ?>" title="<?php echo esc_html($field_caption_label) ?>" name="<?php echo $mapping_field_name ?>[<?php echo $_idx ?>][label]" value="<?php echo $caption ?>" />
                        <label class="sub-label" for="<?php echo $field_id_mapping ?>"><?php echo esc_html($field_caption_mapping) ?></label>
                        <textarea class="sub-field" id="<?php echo esc_attr($field_id_mapping) ?>_mapping" name="<?php echo $mapping_field_name ?>[<?php echo $_idx ?>][mapping]" title="<?php echo esc_attr($field_caption_mapping) ?>"><?php
                            echo esc_html($mapping);
                        ?></textarea>
                        <?php
                    }
                ?>
                    </div>
                </div>
                <style>
                    div.form-field {
                        padding: 5px 20px 5px 162px;
                        margin: 9px 0;
                    }

                    .form-field .sub-label {
                        margin-left: 0px;
                        clear: both;
                    }

                    .form-field .sub-field {
                        clear: both;
                    }

                    .form-field .subfield-wrapper {
                        width: auto;
                        overflow: auto;
                        vertical-align: middle;
                        float: none;
                    }

                    .form-field .subfield-wrapper textarea {
                        width: 50%;
                        height: 100px;
                    }
                </style>
        </div>
        <?php
        $output = ob_get_clean();

        return $output;
    }

    protected function get_tab() {
        return array(
            'label'		=> __( 'Product TXT - Address Splitting', 'wcftxtas' ),
            'target'	=> 'wcftxtas_tab_data',
            'class'		=> array( 'show_if_simple' ),
        );
    }

    protected function save_tab_data( $post_id ) {
        $enable_wcftxtas = isset( $_POST['_wcftxtas_enabled'] ) ? 'yes' : 'no';
        update_post_meta( $post_id, '_wcftxtas_enabled', $enable_wcftxtas );

        if ( isset( $_POST[static::MAPPING_FIELD_NAME] ) ) {
            // For some reason, the data comes in slashed, which causes problems with JSON.
            $mapping = wp_unslash($_POST[static::MAPPING_FIELD_NAME]);
            $mapping = $this->serialize_map_field($mapping);
            update_post_meta( $post_id, static::MAPPING_FIELD_NAME, $mapping );
        }
    }

    protected function serialize_map_field($value) {
        // Prepare JSON to be saved.
        if (is_array($value)) {
            foreach ($value as $_idx => &$_data) {
                // Text representing JSON - because the whole object gets encoded later
                $_data['mapping'] = json_decode($_data['mapping']);

                // Escaping linebreaks for JSON
                if (isset($_data['placeholder'])) {
                    $_data['placeholder'] = preg_replace('![\n\r]+!', '\n', $_data['placeholder']);
                }
            }
        }

        // Finally encode the object
        if (!is_scalar($value)) {
            $value = json_encode($value);
        }

        return $value;
    }

    protected function get_json_field( $post_id, $field_name ) {
        $meta = get_post_meta( $post_id, $field_name, true );
        if ( !$meta ) {
            return null;
        }

        $meta = json_decode( $meta );

        return $meta;
    }

    protected function get_field_map( $post_id ) {
        return $this->get_json_field( $post_id, static::MAPPING_FIELD_NAME );
    }
}

function wcftxtas() {
    $plugin = null;

    if (is_null($plugin)) {
        $basePath = __FILE__;
        $baseDir = dirname($basePath);
        $baseUrl = plugins_urL('', $basePath);

        $plugin = new Plugin($baseDir, $baseUrl);
    }

    return $plugin;
}

wcftxtas()->hook();

