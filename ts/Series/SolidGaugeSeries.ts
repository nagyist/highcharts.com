/* *
 *
 *  Solid angular gauge module
 *
 *  (c) 2010-2020 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

import type ColorAxis from '../Core/Axis/ColorAxis';
import type ColorType from '../Core/Color/ColorType';
import type GradientColor from '../Core/Color/GradientColor';
import type GaugePoint from './Gauge/GaugePoint';
import type GaugePointOptions from './Gauge/GaugePointOptions';
import type GaugeSeriesOptions from './Gauge/GaugeSeriesOptions';
import type RadialAxis from '../Core/Axis/RadialAxis';
import type { SeriesStatesOptions } from '../Core/Series/SeriesOptions';
import type SVGAttributes from '../Core/Renderer/SVG/SVGAttributes';
import type SVGPath from '../Core/Renderer/SVG/SVGPath';
import BaseSeries from '../Core/Series/Series.js';
import GaugeSeries from './Gauge/GaugeSeries.js';
import Color from '../Core/Color/Color.js';
const {
    parse: color
} = Color;
import H from '../Core/Globals.js';
const {
    Renderer
} = H;
import LegendSymbolMixin from '../Mixins/LegendSymbol.js';
import U from '../Core/Utilities.js';
const {
    clamp,
    extend,
    isNumber,
    merge,
    pick,
    pInt,
    wrap
} = U;

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {
        class SolidGaugePoint extends GaugePoint {
            options: SolidGaugePointOptions;
            series: SolidGaugeSeries;
        }
        interface SolidGaugePointOptions extends GaugePointOptions {
            innerRadius?: (number|string);
            radius?: (number|string);
        }
        interface SolidGaugeSeriesOptions extends GaugeSeriesOptions {
            innerRadius?: (number|string);
            linecap?: string;
            overshoot?: number;
            radius?: (number|string);
            rounded?: boolean;
            states?: SeriesStatesOptions<SolidGaugeSeries>;
            threshold?: number;
        }
        interface SymbolOptionsObject {
            rounded?: boolean;
        }
    }
}

import '../Core/Options.js';

/**
 * Additional options, depending on the actual symbol drawn.
 *
 * @interface Highcharts.SymbolOptionsObject
 *//**
 * Whether to draw rounded edges.
 * @name Highcharts.SymbolOptionsObject#rounded
 * @type {boolean|undefined}
 */

/**
 * Symbol definition of an arc with round edges.
 *
 * @private
 * @function Highcharts.Renderer#symbols.arc
 *
 * @param {number} x
 *        The X coordinate for the top left position.
 *
 * @param {number} y
 *        The Y coordinate for the top left position.
 *
 * @param {number} w
 *        The pixel width.
 *
 * @param {number} h
 *        The pixel height.
 *
 * @param {Highcharts.SymbolOptionsObject} [options]
 *        Additional options, depending on the actual symbol drawn.
 *
 * @return {Highcharts.SVGPathArray}
 *         Path of the created arc.
 */
wrap(
    Renderer.prototype.symbols,
    'arc',
    function (
        proceed: Function,
        x: number,
        y: number,
        w: number,
        h: number,
        options: Highcharts.SymbolOptionsObject
    ): SVGPath {
        var arc = proceed,
            path: SVGPath = arc(x, y, w, h, options);

        if (options.rounded) {
            var r = options.r || w,
                smallR = (r - (options.innerR || 0)) / 2,
                outerArcStart = path[0],
                innerArcStart = path[2];

            if (outerArcStart[0] === 'M' && innerArcStart[0] === 'L') {
                const x1 = outerArcStart[1],
                    y1 = outerArcStart[2],
                    x2 = innerArcStart[1],
                    y2 = innerArcStart[2],
                    roundStart: SVGPath.Arc = ['A', smallR, smallR, 0, 1, 1, x1, y1],
                    roundEnd: SVGPath.Arc = ['A', smallR, smallR, 0, 1, 1, x2, y2];

                // Replace the line segment and the last close segment
                path[2] = roundEnd;
                path[4] = roundStart;
            }
        }

        return path;
    }
);

/* eslint-disable valid-jsdoc */

/**
 * @private
 */
interface SolidGaugeAxis extends RadialAxis {
    dataClasses: ColorAxis['dataClasses'];
    options: SolidGaugeAxis.Options;
    stops: ColorAxis['stops'];
    initDataClasses(userOptions: ColorAxis.Options): void;
    initStops(userOptions: ColorAxis.Options): void;
    toColor(
        value: number,
        point: Highcharts.SolidGaugePoint
    ): (ColorType|undefined);
}

/**
 * @private
 */
namespace SolidGaugeAxis {

    /* *
     *
     *  Interfaces
     *
     * */

    export interface Options extends ColorAxis.Options {
        dataClassColor?: ColorAxis.Options['dataClassColor'];
        dataClasses?: ColorAxis.Options['dataClasses'];
        maxColor?: ColorAxis.Options['maxColor'];
        minColor?: ColorAxis.Options['minColor'];
        stops?: ColorAxis.Options['stops'];
    }

    /* *
     *
     *  Constants
     *
     * */

    /**
     * These methods are defined in the ColorAxis object, and copied here.
     * @private
     *
     * @todo
     * If we implement an AMD system we should make ColorAxis a dependency.
     */
    const methods = {

        initDataClasses: function (
            this: SolidGaugeAxis,
            userOptions: ColorAxis.Options
        ): void {
            var chart = this.chart,
                dataClasses: Array<ColorAxis.DataClassesOptions>,
                colorCounter = 0,
                options = this.options;

            this.dataClasses = dataClasses = [];

            (userOptions.dataClasses as any).forEach(function (
                dataClass: ColorAxis.DataClassesOptions,
                i: number
            ): void {
                var colors: (Array<string>|undefined);

                dataClass = merge(dataClass);
                dataClasses.push(dataClass);
                if (!dataClass.color) {
                    if (options.dataClassColor === 'category') {
                        colors = chart.options.colors;
                        dataClass.color = (colors as any)[colorCounter++];
                        // loop back to zero
                        if (colorCounter === (colors as any).length) {
                            colorCounter = 0;
                        }
                    } else {
                        dataClass.color = color(options.minColor).tweenTo(
                            color(options.maxColor),
                            i / ((userOptions.dataClasses as any).length - 1)
                        );
                    }
                }
            });
        },

        initStops: function (
            this: SolidGaugeAxis,
            userOptions: ColorAxis.Options
        ): void {
            this.stops = userOptions.stops || [
                [0, this.options.minColor as any],
                [1, this.options.maxColor as any]
            ];
            this.stops.forEach(function (
                stop: GradientColor['stops'][0]
            ): void {
                stop.color = color(stop[1]);
            });
        },
        // Translate from a value to a color
        toColor: function (
            this: SolidGaugeAxis,
            value: number,
            point: Highcharts.SolidGaugePoint
        ): (ColorType|undefined) {
            var pos: number,
                stops = this.stops,
                from: (number|GradientColor['stops'][0]|undefined),
                to: (number|GradientColor['stops'][0]|undefined),
                color: (ColorType|undefined),
                dataClasses = this.dataClasses,
                dataClass: (ColorAxis.DataClassesOptions|undefined),
                i: (number|undefined);

            if (dataClasses) {
                i = dataClasses.length;
                while (i--) {
                    dataClass = dataClasses[i];
                    from = dataClass.from;
                    to = dataClass.to;
                    if (
                        (typeof from === 'undefined' || value >= from) &&
                        (typeof to === 'undefined' || value <= to)
                    ) {
                        color = dataClass.color;
                        if (point) {
                            point.dataClass = i;
                        }
                        break;
                    }
                }

            } else {

                if (this.logarithmic) {
                    value = this.val2lin(value);
                }
                pos = 1 - ((this.max - value) / (this.max - this.min));
                i = stops.length;
                while (i--) {
                    if (pos > stops[i][0]) {
                        break;
                    }
                }
                from = stops[i] || stops[i + 1];
                to = stops[i + 1] || from;

                // The position within the gradient
                pos = (1 - ((to as any)[0] - pos) / (((to as any)[0] -
                    (from as any)[0]) || 1));

                color = (from as any).color.tweenTo(
                    (to as any).color,
                    pos
                );
            }
            return color;
        }
    };

    /* *
     *
     *  Functions
     *
     * */

    /**
     * @private
     */
    export function init(axis: RadialAxis): void {
        extend(axis, methods);
    }

}

/**
 * A solid gauge is a circular gauge where the value is indicated by a filled
 * arc, and the color of the arc may variate with the value.
 *
 * @sample highcharts/demo/gauge-solid/
 *         Solid gauges
 *
 * @extends      plotOptions.gauge
 * @excluding    dial, pivot, wrap
 * @product      highcharts
 * @requires     modules/solid-gauge
 * @optionparent plotOptions.solidgauge
 */
var solidGaugeOptions: Highcharts.SolidGaugeSeriesOptions = {
    /**
     * The inner radius for points in a solid gauge. Can be given as a number
     * (pixels) or percentage string.
     *
     * @sample {highcharts} highcharts/plotoptions/solidgauge-radius/
     *         Individual radius and innerRadius
     *
     * @type      {number|string}
     * @default   60
     * @since     4.1.6
     * @product   highcharts
     * @apioption plotOptions.solidgauge.innerRadius
     */

    /**
     * Whether the strokes of the solid gauge should be `round` or `square`.
     *
     * @sample {highcharts} highcharts/demo/gauge-activity/
     *         Rounded gauge
     *
     * @type       {string}
     * @default    round
     * @since      4.2.2
     * @product    highcharts
     * @validvalue ["square", "round"]
     * @apioption  plotOptions.solidgauge.linecap
     */

    /**
     * Allow the gauge to overshoot the end of the perimeter axis by this
     * many degrees. Say if the gauge axis goes from 0 to 60, a value of
     * 100, or 1000, will show 5 degrees beyond the end of the axis when this
     * option is set to 5.
     *
     * @type      {number}
     * @default   0
     * @since     3.0.10
     * @product   highcharts
     * @apioption plotOptions.solidgauge.overshoot
     */

    /**
     * The outer radius for points in a solid gauge. Can be given as a number
     * (pixels) or percentage string.
     *
     * @sample {highcharts} highcharts/plotoptions/solidgauge-radius/
     *         Individual radius and innerRadius
     *
     * @type      {number|string}
     * @default   100
     * @since     4.1.6
     * @product   highcharts
     * @apioption plotOptions.solidgauge.radius
     */

    /**
     * Wether to draw rounded edges on the gauge.
     *
     * @sample {highcharts} highcharts/demo/gauge-activity/
     *         Activity Gauge
     *
     * @type      {boolean}
     * @default   false
     * @since     5.0.8
     * @product   highcharts
     * @apioption plotOptions.solidgauge.rounded
     */

    /**
     * The threshold or base level for the gauge.
     *
     * @sample {highcharts} highcharts/plotoptions/solidgauge-threshold/
     *         Zero threshold with negative and positive values
     *
     * @type      {number|null}
     * @since     5.0.3
     * @product   highcharts
     * @apioption plotOptions.solidgauge.threshold
     */

    /**
     * Whether to give each point an individual color.
     */
    colorByPoint: true,

    dataLabels: {
        y: 0
    }

};


/* *
 *
 *  Class
 *
 * */

class SolidGaugeSeries extends GaugeSeries {

    /* *
     *
     *  Static properties
     *
     * */

    public static defaultOptions: Highcharts.SolidGaugeSeriesOptions = merge(GaugeSeries.defaultOptions,
        solidGaugeOptions as Highcharts.SolidGaugeSeriesOptions);

    /* *
     *
     *  Properties
     *
     * */

    public data: Array<Highcharts.SolidGaugePoint> = void 0 as any;
    public points: Array<Highcharts.SolidGaugePoint> = void 0 as any;
    public options: Highcharts.SolidGaugeSeriesOptions = void 0 as any;

    public axis: SolidGaugeAxis = void 0 as any;
    public yAxis: SolidGaugeAxis = void 0 as any;
    public startAngleRad: SolidGaugeSeries['thresholdAngleRad'] = void 0 as any;
    public thresholdAngleRad: number = void 0 as any;
    /* *
     *
     *  Functions
     *
     * */

}

/* *
 *
 *  Prototype properties
 *
 * */

interface SolidGaugeSeries extends GaugeSeries {
    pointClass: typeof Highcharts.SolidGaugePoint;
    animate(init?: boolean): void;
    drawPoints(): void;
    translate(): void;
}
extend(SolidGaugeSeries.prototype, {
    drawLegendSymbol: LegendSymbolMixin.drawRectangle,
    // Extend the translate function to extend the Y axis with the necessary
    // decoration (#5895).
    translate: function (this: SolidGaugeSeries): void {
        var axis = this.yAxis;

        SolidGaugeAxis.init(axis);

        // Prepare data classes
        if (!axis.dataClasses && axis.options.dataClasses) {
            axis.initDataClasses(axis.options);
        }
        axis.initStops(axis.options);

        // Generate points and inherit data label position
        H.seriesTypes.gauge.prototype.translate.call(this);
    },

    // Draw the points where each point is one needle.
    drawPoints: function (this: SolidGaugeSeries): void {
        var series = this,
            yAxis = series.yAxis,
            center = yAxis.center,
            options = series.options,
            renderer = series.chart.renderer,
            overshoot = options.overshoot,
            overshootVal = isNumber(overshoot) ?
                overshoot / 180 * Math.PI :
                0,
            thresholdAngleRad: (number | undefined);

        // Handle the threshold option
        if (isNumber(options.threshold)) {
            thresholdAngleRad = yAxis.startAngleRad + (yAxis.translate(
                options.threshold,
                null,
                null,
                null,
                true
            ) as any);
        }
        this.thresholdAngleRad = pick(
            thresholdAngleRad, yAxis.startAngleRad
        );


        series.points.forEach(function (
            point: Highcharts.SolidGaugePoint
        ): void {
            // #10630 null point should not be draw
            if (!point.isNull) { // condition like in pie chart
                var graphic = point.graphic,
                    rotation = (yAxis.startAngleRad +
                        (yAxis.translate(
                            point.y as any,
                            null,
                            null,
                            null,
                            true
                        ) as any)),
                    radius = ((
                        pInt(
                            pick(
                                point.options.radius,
                                options.radius,
                                100
                            )
                        ) * center[2]
                    ) / 200),
                    innerRadius = ((
                        pInt(
                            pick(
                                point.options.innerRadius,
                                options.innerRadius,
                                60
                            )
                        ) * center[2]
                    ) / 200),
                    shapeArgs: (SVGAttributes | undefined),
                    d: (string | SVGPath | undefined),
                    toColor = yAxis.toColor(point.y as any, point),
                    axisMinAngle = Math.min(
                        yAxis.startAngleRad,
                        yAxis.endAngleRad
                    ),
                    axisMaxAngle = Math.max(
                        yAxis.startAngleRad,
                        yAxis.endAngleRad
                    ),
                    minAngle,
                    maxAngle;

                if (toColor === 'none') { // #3708
                    toColor = point.color || series.color || 'none';
                }
                if (toColor !== 'none') {
                    point.color = toColor;
                }

                // Handle overshoot and clipping to axis max/min
                rotation = clamp(
                    rotation,
                    axisMinAngle - overshootVal,
                    axisMaxAngle + overshootVal
                );

                // Handle the wrap option
                if (options.wrap === false) {
                    rotation = clamp(rotation, axisMinAngle, axisMaxAngle);
                }

                minAngle = Math.min(rotation, series.thresholdAngleRad);
                maxAngle = Math.max(rotation, series.thresholdAngleRad);

                if (maxAngle - minAngle > 2 * Math.PI) {
                    maxAngle = minAngle + 2 * Math.PI;
                }

                point.shapeArgs = shapeArgs = {
                    x: center[0],
                    y: center[1],
                    r: radius,
                    innerR: innerRadius,
                    start: minAngle,
                    end: maxAngle,
                    rounded: options.rounded
                };
                point.startR = radius; // For PieSeries.animate

                if (graphic) {
                    d = shapeArgs.d;
                    graphic.animate(extend({ fill: toColor }, shapeArgs));
                    if (d) {
                        shapeArgs.d = d; // animate alters it
                    }
                } else {
                    point.graphic = graphic = renderer.arc(shapeArgs)
                        .attr({
                            fill: toColor,
                            'sweep-flag': 0
                        })
                        .add(series.group);
                }

                if (!series.chart.styledMode) {
                    if (options.linecap !== 'square') {
                        graphic.attr({
                            'stroke-linecap': 'round',
                            'stroke-linejoin': 'round'
                        });
                    }
                    graphic.attr({
                        stroke: options.borderColor || 'none',
                        'stroke-width': options.borderWidth || 0
                    });
                }

                if (graphic) {
                    graphic.addClass(point.getClassName(), true);
                }
            }
        });
    },

    // Extend the pie slice animation by animating from start angle and up.
    animate: function (
        this: SolidGaugeSeries,
        init?: boolean
    ): void {

        if (!init) {
            this.startAngleRad = this.thresholdAngleRad;
            H.seriesTypes.pie.prototype.animate.call(this, init);
        }
    }
});


/* *
 *
 *  Registry
 *
 * */


/**
 * @private
 */
declare module '../Core/Series/SeriesType' {
    interface SeriesTypeRegistry {
        solidgauge: typeof SolidGaugeSeries;
    }
}

BaseSeries.registerSeriesType('solidgauge', SolidGaugeSeries);

/* *
 *
 *  Default export
 *
 * */

export default SolidGaugeSeries;

/**
 * A `solidgauge` series. If the [type](#series.solidgauge.type) option is not
 * specified, it is inherited from [chart.type](#chart.type).
 *
 *
 * @extends   series,plotOptions.solidgauge
 * @excluding animationLimit, boostThreshold, connectEnds, connectNulls,
 *            cropThreshold, dashStyle, dataParser, dataURL, dial,
 *            findNearestPointBy, getExtremesFromAll, marker, negativeColor,
 *            pointPlacement, pivot, shadow, softThreshold, stack, stacking,
 *            states, step, threshold, turboThreshold, wrap, zoneAxis, zones,
 *            dataSorting, boostBlending
 * @product   highcharts
 * @requires  modules/solid-gauge
 * @apioption series.solidgauge
 */

/**
 * An array of data points for the series. For the `solidgauge` series
 * type, points can be given in the following ways:
 *
 * 1. An array of numerical values. In this case, the numerical values will be
 *    interpreted as `y` options. Example:
 *    ```js
 *    data: [0, 5, 3, 5]
 *    ```
 *
 * 2. An array of objects with named values. The following snippet shows only a
 *    few settings, see the complete options set below. If the total number of
 *    data points exceeds the series'
 *    [turboThreshold](#series.solidgauge.turboThreshold), this option is not
 *    available.
 *    ```js
 *    data: [{
 *        y: 5,
 *        name: "Point2",
 *        color: "#00FF00"
 *    }, {
 *        y: 7,
 *        name: "Point1",
 *        color: "#FF00FF"
 *    }]
 *    ```
 *
 * The typical gauge only contains a single data value.
 *
 * @sample {highcharts} highcharts/chart/reflow-true/
 *         Numerical values
 * @sample {highcharts} highcharts/series/data-array-of-objects/
 *         Config objects
 *
 * @type      {Array<number|null|*>}
 * @extends   series.gauge.data
 * @product   highcharts
 * @apioption series.solidgauge.data
 */

/**
 * The inner radius of an individual point in a solid gauge. Can be given as a
 * number (pixels) or percentage string.
 *
 * @sample {highcharts} highcharts/plotoptions/solidgauge-radius/
 *         Individual radius and innerRadius
 *
 * @type      {number|string}
 * @since     4.1.6
 * @product   highcharts
 * @apioption series.solidgauge.data.innerRadius
 */

/**
 * The outer radius of an individual point in a solid gauge. Can be
 * given as a number (pixels) or percentage string.
 *
 * @sample {highcharts} highcharts/plotoptions/solidgauge-radius/
 *         Individual radius and innerRadius
 *
 * @type      {number|string}
 * @since     4.1.6
 * @product   highcharts
 * @apioption series.solidgauge.data.radius
 */

''; // adds doclets above to transpiled file
