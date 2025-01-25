import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Drawer, DrawerProps, Input, Select, Space, Spin, Timeline, Typography } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from "ag-grid-community";
import { AiOutlineHistory, AiOutlineInfoCircle } from "react-icons/ai";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import PDFLoader from "../../classes/PDFLoader";
import type { SearchProps } from 'antd/es/input/Search';
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import {ToEmployerUseData} from '../../classes/ToEmployerDataProvider'
import { RowData } from "@/components/utils/ToEmployerGoogleSheet";

// Define props interface
interface ToEmployerProps { }



const ToEmployer: React.FC<ToEmployerProps> = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger the animation after the component mounts
        setIsVisible(true);
    }, []);
    const { toEmployerLoading, toEmployerData, toEmployerError } = ToEmployerUseData();
    const { Title, Text, Paragraph } = Typography;
    const { Search } = Input;
    const [isConditionMet, setIsConditionMet] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string | null>(null);
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [open, setOpen] = useState(false);
    const [slNo, setSlNo] = useState<number | null>(null);
    const [runnNum, setRunnNum] = useState("");
    const [draftBy, setDraftBy] = useState("");
    const [refNo, setRefNo] = useState("");
    const [title, setTitle] = useState("");
    const [subDate, setSubDate] = useState("");
    const [comments, setComments] = useState("");
    const [remarks, setRemarks] = useState("");
    const [placement, setPlacement] = useState<DrawerProps['placement']>('right');
    const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
    const previewPDF = (pdfUrl: string) => {
        setSelectedPdfUrl(pdfUrl);
    };

    const handleLoadPdf = (pdfUrl: string) => {
        // Do something with the URL if needed
        console.log(`Loading PDF: ${pdfUrl}`);
    };

    const agRootWrapperRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<AgGridReact>(null);
    const [pageSize, setPageSize] = useState<number>(10);
    const containerStyle = useMemo(() => ({ width: '100%', height: '80vh' }), []);
    const gridStyle = useMemo(() => ({ height: '72vh', width: '100%' }), []);
    const [agGridApi, setAgGridApi] = useState<GridApi | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);



    const onClose = () => {
        setOpen(false);
    };

    const downloadFile = async (originalFileName: string) => {
        try {
            console.log("clicked : "+ originalFileName);
            previewPDF(originalFileName);
          } catch (error) {
            console.error('Error downloading files:', error);
          }
        
    }

    const columnDefs: (ColDef | ColGroupDef)[] = [
        { headerName: 'SL \n No.', field: 'slNo', width: 70, pinned: 'left', resizable: true, sortable: true, autoHeight: true, cellStyle: { display: 'flex', justifyContent: 'center', } },
        { headerName: 'Running No.', field: 'runnNum', filter: 'agTextColumnFilter', width: 150, wrapText: true, pinned: 'left', floatingFilter: true, resizable: true, sortable: true, autoHeight: true, cellStyle: { display: 'flex', alignItems: 'center' } },
        { headerName: 'Reference No.', field: 'refNo', filter: 'agTextColumnFilter', width: 150, wrapText: true, pinned: 'left', floatingFilter: true, resizable: true, sortable: true, autoHeight: true, cellStyle: { display: 'flex', alignItems: 'center' } },
        { headerName: 'Drafted By', field: 'draftBy', filter: 'agTextColumnFilter', width: 150, wrapText: true, sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
        { headerName: 'Title', field: 'title', filter: 'agTextColumnFilter', width: 200, wrapText: true, floatingFilter: true, resizable: true, sortable: true, autoHeight: true },
        { headerName: 'Submission Date', field: 'subDate', filter: 'agDateColumnFilter', sortable: true, cellStyle: { textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Comments', field: 'comments', filter: 'agTextColumnFilter', sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
        { headerName: 'Remarks', field: 'remarks', filter: 'agTextColumnFilter', sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
        {
            headerName: 'More Info', field: 'info', width: 90, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }, cellRenderer: function (params: any) {
                
                const srlNo = params.node.data.slNo + ".pdf";
                return (
                    //horizontally center button?
                    <>
                        <div className='d-flex align-items-center justify-content-evenly h-100'>
                            <Button type="default" icon={<AiOutlineHistory />}
                                onClick={(e: React.MouseEvent<HTMLElement>) => {
                                    e.stopPropagation(); // Prevent row selection when the button is clicked
                                    showDrawer(params.node.data);
                                }} />
                            <Button type="default" icon={<AiOutlineInfoCircle />}
                                onClick={() =>
                                    downloadFile(srlNo)
                                  } />
                        </div>

                    </>

                );
            },
            cellRendererParams: {
                onClick: (params: any) => {
                    // Handle button click, e.g., open a modal, perform an action, etc.
                    console.log('Button clicked for row:', params.node.data);
                },
            },
        },
    ];

    const agGridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: pageSize,
        getRowHeight: () => 50,
    };

    const onGridReady = (params: GridReadyEvent) => {
        setAgGridApi(params.api);
    };

    useEffect(() => {
        if (agRootWrapperRef.current) {
            // Apply styles to children of children
            const childrenOfChildren = agRootWrapperRef.current.querySelector('.ag-root-wrapper .ag-ltr ag-layout-normal') as HTMLDivElement | null;
            if (childrenOfChildren) {
                // Apply styles to children of children
                childrenOfChildren.style.borderColor = '#dee2e6';
                // Add more styles as needed
            }
        }
    }, []);

    const onPageSizeChanged = (value: number) => {
        setPageSize(value);

        if (agGridApi) {
            agGridApi.paginationSetPageSize(value);
        } else {
            console.error('AgGrid API is not available');
        }
    };

    const onGoToPageChanged = (value: number) => {
        if (value >= 1 && value <= totalPages) {
            setCurrentPage(value);
            if (agGridApi) {
                agGridApi.paginationGoToPage(value - 1); // Pagination is 0-based
            }
        }
    };



    const [searchText, setSearchText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const onFilterTextBoxChanged: SearchProps['onSearch'] = (value, _e, info) => {
        setSearchText(value);
        if (agGridApi) {
            agGridApi.setQuickFilter(value); // Set quick filter value
        }
    };

    const onClearSearch = () => {
        setSearchText('');
        if (agGridApi) {
            agGridApi.setQuickFilter(''); // Clear quick filter value
        }
    };

    const onFocusChange = () => {
        setIsFocused(true);
    };

    const onBlurChange = () => {
        setIsFocused(false);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        if (agGridApi) {
            agGridApi.setQuickFilter(e.target.value); // Set quick filter value
        }
    };




    const onPageChanged = () => {
        if (agGridApi) {
            setTotalPages(agGridApi.paginationGetTotalPages());
        }
    };

    useEffect(() => {
        onPageChanged();
    }, [agGridApi]);

    const [data, setData] = useState<RowData[]>([]);

    useEffect(() => {
        if (!toEmployerLoading && toEmployerData) {
            setRowData(toEmployerData);
            setLoading(false);
        } else if (toEmployerError) {
            setErrors(toEmployerError);
            setLoading(false);
        }
    }, [toEmployerLoading, toEmployerData, toEmployerError]);

    const showDrawer = (rowData: RowData) => {
        setOpen(true);
        setSlNo(rowData.slNo ?? null);
        setRunnNum(rowData.runnNum ?? "");
        setRefNo(rowData.refNo ?? "");
        setTitle(rowData.title ?? "");
        setDraftBy(rowData.draftBy ?? "");
        setSubDate(rowData.subDate ?? "");
        setComments(rowData.comments ?? "");
        setRemarks(rowData.remarks ?? "");
    };


    return (
        <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-wrap">
                <div className="w-full md:w-2/3">
                    <div className="p-1">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <Spin spinning={toEmployerLoading} size="large">
                                <div className="w-full h-[80vh]">
                                    <table className='border border-slate-400 border-b-0 w-full'>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <Paragraph className="mb-1 text-sm">
                                                        <div className="flex flex-wrap p-1">
                                                            <div className="lg:w-1/2 w-full mb-1">
                                                                <div className="flex w-full ag-q-filter">
                                                                    <Search
                                                                        size="small"
                                                                        placeholder="Quick Filter"
                                                                        onSearch={onFilterTextBoxChanged}
                                                                        value={searchText}
                                                                        onChange={onInputChange}
                                                                        onFocus={onFocusChange}
                                                                        onBlur={onBlurChange}
                                                                        className="w-full text-sm"
                                                                        suffix={
                                                                            searchText && <span className="cursor-pointer" onClick={onClearSearch}><IoMdClose /></span>
                                                                        }
                                                                        autoFocus={isFocused} // Focus the input if it was focused before
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Paragraph>

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div ref={agRootWrapperRef} className="ag-theme-balham" style={gridStyle}>
                                        <AgGridReact
                                            columnDefs={columnDefs}
                                            rowData={rowData}
                                            rowSelection={'single'}
                                            enableCellTextSelection={true}
                                            gridOptions={agGridOptions}
                                            onGridReady={onGridReady}
                                            onPaginationChanged={onPageChanged}
                                        />
                                    </div>
                                </div>
                            </Spin>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/3">
                    <div className="p-1">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <PDFLoader pdfFileUrlProp={selectedPdfUrl}  />
                        </div>
                    </div>
                </div>
            </div>
            <Drawer
                title="Letter Timeline"
                placement="right"
                closable={true}
                onClose={onClose}
                open={open}
            >
                <Timeline
                    items={[
                        {
                            color: 'gray',
                            children: (
                                <>
                                    <p><b>Reference No: </b>MRT1CS-ADM-CP01-0008/2023</p>
                                    <p><b>Title: </b>Instruction to Commence the Work</p>
                                    <p><b>Date: </b>26 Feb 2023</p>
                                    <p><b>Issued By: </b>CSC</p>
                                    <p><b>Remarks: </b>Reply Required</p>
                                </>
                            ),
                        },
                        {
                            color: 'green',
                            children: (
                                <>
                                    <p><b>Reference No: </b>MRT1CS-ADM-CP01-0008/2023</p>
                                    <p><b>Title: </b>Instruction to Commence the Work</p>
                                    <p><b>Date: </b>26 Feb 2023</p>
                                    <p><b>Issued By: </b>CSC</p>
                                    <p><b>Remarks: </b>Reply Required</p>
                                </>
                            ),
                        },
                        {
                            color: 'gray',
                            children: (
                                <>
                                    <p><b>Reference No: </b>MRT1CS-ADM-CP01-0008/2023</p>
                                    <p><b>Title: </b>Instruction to Commence the Work</p>
                                    <p><b>Date: </b>26 Feb 2023</p>
                                    <p><b>Issued By: </b>CSC</p>
                                    <p><b>Remarks: </b>Reply Required</p>
                                </>
                            ),
                        },
                    ]}
                />
            </Drawer>

        </div>
    );
};

export default ToEmployer;
