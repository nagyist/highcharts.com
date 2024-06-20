/* *
 *
 *  Data Grid class
 *
 *  (c) 2020-2024 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *  - Sebastian Bochan
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type DataGridOptions from './DataGridOptions';

import DataGridDefaultOptions from './DataGridDefaultOptions.js';
import DataGridTable from './DataGridTable.js';
import DataGridUtils from './Utils.js';
import DataTable from '../../Data/DataTable.js';
import Globals from './Globals.js';
import U from '../../Core/Utilities.js';

const { makeDiv, makeHTMLElement } = DataGridUtils;
const { win } = Globals;
const { merge } = U;


/* *
 *
 *  Class
 *
 * */

/**
 * Creates a scrollable grid structure (table).
 */
class DataGrid {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * Default options for all DataGrid instances.
     */
    public static readonly defaultOptions = DataGridDefaultOptions;


    /**
     * The container of the data grid.
     */
    public container: HTMLElement;

    /**
     * The HTML element of the table.
     */
    public tableElement: HTMLTableElement;

    /**
     * The data source of the data grid.
     */
    public dataTable: DataTable;

    /**
     * The options of the data grid.
     */
    public options: DataGridOptions;

    /**
     * The user options of the data grid.
     */
    public userOptions: DataGridOptions;

    /**
     * The table (viewport) element of the data grid.
     */
    public viewport: DataGridTable;

    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a new data grid.
     *
     * @param renderTo The render target (container) of the data grid.
     * @param options The options of the data grid.
     */
    constructor(renderTo: string|HTMLElement, options: DataGridOptions) {
        this.userOptions = options;
        this.options = merge(DataGrid.defaultOptions, options);

        this.container = DataGrid.initContainer(renderTo);

        this.tableElement = makeHTMLElement('table', {
            className: Globals.classNames.tableElement
        }, this.container);

        if (options.table instanceof DataTable) {
            this.dataTable = options.table;
        } else {
            this.dataTable = new DataTable(options.table);
        }

        this.viewport = new DataGridTable(this);

        // Accessibility
        this.tableElement.setAttribute(
            'aria-rowcount',
            this.dataTable.getRowCount()
        );
    }

    /* *
    *
    *  Methods
    *
    * */


    /* *
    *
    *  Static Methods
    *
    * */

    /**
     * Initializes the container of the data grid.
     *
     * @param renderTo The render target (html element or id) of the data grid.
     * @returns The container element of the data grid.
     */
    private static initContainer(renderTo: string|HTMLElement): HTMLElement {
        if (typeof renderTo === 'string') {
            const existingContainer = win.document.getElementById(renderTo);
            if (existingContainer) {
                existingContainer.classList.add(Globals.classNames.container);
                return existingContainer;
            }
            return makeDiv(Globals.classNames.container, renderTo);
        }
        renderTo.classList.add(Globals.classNames.container);
        return renderTo;
    }
}


/* *
 *
 *  Class Namespace
 *
 * */

namespace DataGrid {

}


/* *
 *
 *  Default Export
 *
 * */

export default DataGrid;
