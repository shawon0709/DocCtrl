import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Drawer, DrawerProps, Input, Spin, Timeline, Typography } from 'antd';
import type { SearchProps } from 'antd/es/input/Search';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from "ag-grid-community";
import { AiOutlineHistory, AiOutlineInfoCircle } from "react-icons/ai";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import PDFLoader from "../../classes/PDFLoader";
import { RowData } from "@/components/utils/FromConsultantGoogleSheet";
import { FromConsultantUseData } from "@/components/classes/FromConsultantDataProvider";
import { IoMdClose } from "react-icons/io";

// Define props interface
interface FromConsultantProps { }

const FromConsultant: React.FC<FromConsultantProps> = () => {
    const { fromConsultantLoading, fromConsultantData, fromConsultantError, fetchFromConsultantData } = FromConsultantUseData();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger the animation after the component mounts
        setIsVisible(true);
    }, []);
    const { Title, Text, Paragraph } = Typography;
    const { Search } = Input;
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string | null>(null);
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [open, setOpen] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const onFilterTextBoxChanged: SearchProps['onSearch'] = (value, _e, info) => {
        setSearchText(value);
        if (agGridApi) {
            agGridApi.setQuickFilter(value); // Set quick filter value
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        if (agGridApi) {
            agGridApi.setQuickFilter(e.target.value); // Set quick filter value
        }
    };

    const onFocusChange = () => {
        setIsFocused(true);
    };

    const onBlurChange = () => {
        setIsFocused(false);
    };

    const onClearSearch = () => {
        setSearchText('');
        if (agGridApi) {
            agGridApi.setQuickFilter(''); // Clear quick filter value
        }
    };

    const [hospitalName, setHospitalName] = useState("");
    const [contactPerosn, setContactPerosn] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [address, setAddress] = useState("");
    const [packageName, setPackageName] = useState("");
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

    const columnDefs: (ColDef | ColGroupDef)[] = [
        { headerName: 'Sl No.', field: 'slNo', width: 70, pinned: 'left', resizable: true, sortable: true, autoHeight: true, cellStyle: { display: 'flex', justifyContent: 'center', } },
        { headerName: 'Reference No.', field: 'refNo', filter: 'agTextColumnFilter', width: 200, wrapText: true, pinned: 'left', floatingFilter: true, resizable: true, sortable: true, autoHeight: true, cellStyle: { display: 'flex', alignItems: 'center' } },
        { headerName: 'Title', field: 'title', filter: 'agTextColumnFilter', width: 250, wrapText: true, floatingFilter: true, resizable: true, sortable: true, autoHeight: true },
        { headerName: 'Date', field: 'date', filter: 'agTextColumnFilter', width: 150, wrapText: true, sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
        {
            headerName: 'More Info', field: 'info', minWidth: 90, suppressSizeToFit: true, resizable: true, cellStyle: { fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center' }, cellRenderer: function (params: any) {
                return (
                    <div className='d-flex align-items-center justify-content-evenly h-100'>
                        <Button type="default" icon={<AiOutlineHistory />}
                            onClick={(e: React.MouseEvent<HTMLElement>) => {
                                e.stopPropagation();
                                showDrawer(params.node.data);
                            }} />
                        <Button type="default" icon={<AiOutlineInfoCircle />}
                            onClick={() =>
                                previewPDF(
                                  'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf'
                                )
                              } />
                    </div>
                );
            },
            cellRendererParams: {
                onClick: (params: any) => {
                    console.log('Button clicked for row:', params.node.data);
                },
            },
        },
      ];

    const agGridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: pageSize,
        getRowHeight: () => 70,
    };

    const onGridReady = (params: GridReadyEvent) => {
        setAgGridApi(params.api);
    };

    useEffect(() => {
        if (agGridApi) {
            agGridApi.sizeColumnsToFit();
        }
    }, [agGridApi]);

    const onPageChanged = () => {
        if (agGridApi) {
            setTotalPages(agGridApi.paginationGetTotalPages());
        }
    };

    useEffect(() => {
        onPageChanged();
    }, [agGridApi]);

    // const fetchData = async () => {
    //     setLoading(true);
    //     try {
    //         // Fetch data from API
    //         const response = await fetch('https://api.example.com/data');
    //         const data: RowData[] = await response.json();

    //         // Set row data
    //         setRowData(data);
    //     } catch (error) {
    //         setErrors('Failed to fetch data');
    //     } finally {
    //         setLoading(false);
    //     }
    // };



    useEffect(() => {
        if (!fromConsultantLoading && fromConsultantData) {
            setRowData(fromConsultantData);
            setLoading(false);
        } else if (fromConsultantError) {
            setErrors(fromConsultantError);
            setLoading(false);
        }
    }, [fromConsultantLoading, fromConsultantData, fromConsultantError]);

    const showDrawer = (rowData: RowData) => {
        setOpen(true);
        //setHospitalName(rowData.hospitalName ?? ""); // Use an empty string if hospitalName is null
    };


    return (
        <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-wrap">
                <div className="w-full md:w-2/3">
                    <div className="p-1">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                    <Spin spinning={fromConsultantLoading} size="large">
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

export default FromConsultant;
