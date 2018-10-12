<?php
/**
 * Plugin Name: WooCommerce Custom Fields - Address Split Addon
 */

namespace XedinUnknown\WC_CFTXT_Address_Split;

class Plugin {
    protected $baseDir;
    protected $baseUrl;
    protected $version = '0.1';

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

            $is_enabled = get_post_meta( $product_id, '_enable_wcftxtas', true ) === 'yes';
            if (!$is_enabled) {
                return false;
            }

            $is_custom_fields_enabled = get_post_meta( $product_id, '_enable_wcft', true ) === 'yes';
            if (!$is_custom_fields_enabled) {
                return false;
            }

            wp_enqueue_script( 'wcftxtas-address-fields-js');
            wp_localize_script( 'wcftxtas-address-fields-js', 'wcftxtasOptions', array(
                'fieldMap'          => $this->get_field_map( $product_id ),
            ) );
        } );
    }

    protected function register_assets() {
        wp_register_script('wcftxtas-address-fields-js', "{$this->baseUrl}/assets/js/address-fields.js", ['jquery'], $this->version, false);
    }

    protected function get_tab_panel_output() {
        ob_start();
        ?>
        <div id="wcftxtas_tab_data" class="panel woocommerce_options_panel">
            <div class="options_group">
                <?php
                woocommerce_wp_checkbox(
                    array(
                        'id'            => '_wcftxtas_enabled',
                        'wrapper_class' => 'show_if_simple',
                        'label'         => __( 'Enable address splitting', 'wcftxtas' ),
                    )
                );

                woocommerce_wp_textarea_input(
                    array(
                        'id'            => '_wcftxtas_field_mapping',
                        'wrapper_class' => 'show_if_simple',
                        'label'         => __( 'Field Mapping', 'wcftxtas' ),
                    )
                );
                ?>
            </div>
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

        if ( isset( $_POST['_wcftxtas_field_mapping'] ) ) {
            update_post_meta( $post_id, '_wcftxtas_field_mapping', $_POST['_wcftxtas_field_mapping'] );
        }
    }

    protected function get_field_map( $post_id ) {
        $meta = get_post_meta( $post_id, '_wcftxtas_field_mapping', true );
        if ( !$meta ) {
            return null;
        }

        $meta = json_decode( $meta );

        return $meta;
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

