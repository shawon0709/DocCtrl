import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MenuProps, RadioChangeEvent, CheckboxProps } from 'antd';
import { Form, Input, DatePicker, Select, Button, Switch, Dropdown, Checkbox, Modal, Radio, Tooltip, Menu, Space, Drawer, Spin, Typography } from 'antd';
import { AiOutlineInfoCircle } from "react-icons/ai";
import { ToConsultantUseData } from '../../classes/ToConsultantDataProvider'
import { MdAdd } from 'react-icons/md';
import moment from 'moment';
import axios from 'axios';
import { RowData } from '@/components/utils/ToConsultantGoogleSheet';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColGroupDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import type { SearchProps } from 'antd/es/input/Search';
import { IoMdClose } from 'react-icons/io';
import { FcInfo } from 'react-icons/fc';

type DraftByItem = {
  name: string;
  title: string;
};

const { TextArea } = Input;
const { Option } = Select;

const ToConsultantNew: React.FC = () => {

  const [form] = Form.useForm();
  const [isSubmission, setIsSubmission] = useState(false);
  const [isSubmissionItems, setIsSubmissionItems] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string | null>(null);
  const [docNumChecked, setDocNumChecked] = useState(true);
  useEffect(() => {
    // Trigger the animation after the component mounts
    setIsVisible(true);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const onDrawerClose = () => {
    setDrawerOpen(false);
  };

  const onDrawerCloseByButtonCLick = () => {
    setDrawerOpen(false);
    gridRef.current?.api.setFilterModel(null);
  };

  const { fetchData, getLastSlNo, getLastRefNo, getLastSrrNo, getLastNumberByType, draftByOption, toConsultantLoading, toConsultantSubmission, toConsultantError } = ToConsultantUseData();
  const [rowData, setRowData] = useState<RowData[]>([]);
  // State to store the last slNo
  const [lastSlNo, setLastSlNo] = useState<number | null>(null);
  const [lastRefNo, setLastRefNo] = useState<string | null>(null);
  const [lastSrrNo, setLastSrrNo] = useState<string | null>(null);
  const [draftByOptions, setDraftByOptions] = useState<DraftByItem[]>([]);
  const [draftBySelectedItems, setDraftBySelectedItems] = useState<string[]>([]);
  const draftByFilteredOptions = draftByOptions.filter(
    (o) => !draftBySelectedItems.includes(`${o.name} ${o.title}`)
  );

  const handleDraftByChange = (values: string[]) => {
    setDraftBySelectedItems(values);
  };

  const agRootWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<AgGridReact>(null);
  const { Paragraph } = Typography;
  const [pageSize, setPageSize] = useState<number>(10);
  const gridStyle = useMemo(() => ({ height: '72vh', width: '100%' }), []);
  const [agGridApi, setAgGridApi] = useState<GridApi | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: '',
      field: 'checkbox',
      width: 40,
      pinned: 'left',
      resizable: true,
      sortable: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }
    },
    { headerName: 'SL \n No.', field: 'slNo', width: 70, pinned: 'left', resizable: true, sortable: true, autoHeight: true, cellStyle: { display: 'flex', justifyContent: 'center', } },
    { headerName: 'SRR', field: 'srrNo', filter: 'agTextColumnFilter', width: 150, wrapText: true, pinned: 'left', floatingFilter: true, resizable: true, sortable: true, autoHeight: true, cellStyle: { display: 'flex', alignItems: 'center' } },
    { headerName: 'Title', field: 'title', filter: 'agTextColumnFilter', width: 200, wrapText: true, floatingFilter: true, resizable: true, sortable: true, autoHeight: true },
    { headerName: 'Drafted By', field: 'draftBy', filter: 'agTextColumnFilter', width: 150, wrapText: true, sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
    { headerName: 'Submission Date', field: 'subDate', filter: 'agDateColumnFilter', sortable: true, cellStyle: { textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' } },
    { headerName: 'Review Date', field: 'revDate', filter: 'agDateColumnFilter', sortable: true, cellStyle: { textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' } },
    { headerName: 'Review Reference No.', field: 'revRefDate', wrapText: true, filter: 'agTextColumnFilter', sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
    { headerName: 'CSC\'s Transmittal Grade', field: 'cscTransGrade', filter: 'agTextColumnFilter', sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
    { headerName: 'Comments', field: 'comments', filter: 'agTextColumnFilter', sortable: true, cellStyle: { textAlign: 'left', display: 'flex', alignItems: 'center' } },
    {
      headerName: 'Document / Drawing Number',
      children: [
        { headerName: 'Project', field: 'project', filter: 'agTextColumnFilter', width: 100, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: '', field: 'projectDash', width: 30, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Organizer', field: 'org', filter: 'agTextColumnFilter', width: 120, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: '', field: 'orgDash', width: 30, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Volume / System', field: 'system', filter: 'agTextColumnFilter', width: 160, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: '', field: 'systemDash', width: 30, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Level / Location', field: 'location', filter: 'agTextColumnFilter', width: 150, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: '', field: 'locationDash', width: 30, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Type', field: 'type', filter: 'agTextColumnFilter', width: 90, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: '', field: 'typeDash', width: 30, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Role', field: 'role', filter: 'agTextColumnFilter', width: 90, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: '', field: 'roleDash', width: 30, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Number', field: 'number', filter: 'agTextColumnFilter', width: 110, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: '', field: 'numberDash', width: 30, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } },
        { headerName: 'Revision', field: 'revision', filter: 'agTextColumnFilter', width: 110, floatingFilter: true, sortable: true, cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' } }
      ],
      headerClass: 'd-flex justify-content-center'
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

  function incrementRevision(label: string): string {
    // Use a regular expression to separate the letter and the number
    const match = label.match(/^([A-Za-z]+)(\d+)$/);
    if (!match) {
      throw new Error("Invalid label format");
    }

    // Extract the letter and the number parts
    const letter = match[1];
    const number = parseInt(match[2], 10);

    // Increment the number
    const incrementedNumber = number + 1;

    // Return the new label
    return `${letter}${incrementedNumber}`;
  }

  function incrementSrr(input: string): string {
    // Regular expression to match the revision part
    const revisionRegex = /\(Rev\. ([A-Za-z]+)(\d+)\)/;
    const match = input.match(revisionRegex);

    if (!match) {
      throw new Error("No revision found in the input string");
    }

    const fullMatch = match[0];
    const letterPart = match[1];
    const numberPart = parseInt(match[2], 10);

    // Increment the number part
    const incrementedNumberPart = numberPart + 1;

    // Construct the new revision string
    const newRevision = `(Rev. ${letterPart}${incrementedNumberPart})`;

    // Replace the old revision with the new revision in the input string
    const output = input.replace(fullMatch, newRevision);

    return output;
  }

  // Trim the extracted items and ensure consistent formatting
  const trimmedDraftByOptions = draftByFilteredOptions.map((option) => ({
    name: option.name.trim(),
    title: option.title.trim(),
  }));

  const addDraftByOption = (itemToAdd: string) => {
    // Use regular expression to match the name and title
    const match = itemToAdd.match(/^(.*)\s+\((.*)\)$/);

    // Check if the match is successful
    if (match) {
      const name = match[1].trim(); // Extract the name and trim whitespace
      const title = `(${match[2].trim()})`; // Extract the title and trim whitespace

      // Check if the name and title are not empty
      if (name && title) {
        // Check if the itemToAdd exists in draftByFilteredOptions
        const isItemInOptions = draftByOptions.some(
          (option) => option.name === name && option.title === title
        );

        if (isItemInOptions) {
          // Add the item to draftBySelectedItems
          setDraftBySelectedItems((prevSelectedItems) => [...prevSelectedItems, `${name} ${title}`]);
        } else {
          // Item not found in options, handle accordingly (e.g., show a message)
          console.log(`${itemToAdd} is not found in options.`);
        }
      } else {
        // Log a message if name or title is empty
        console.log(`${itemToAdd} is not formatted correctly.`);
      }
    } else {
      // Log a message if the regular expression match fails
      console.log(`${itemToAdd} is not formatted correctly.`);
    }
  };

  useEffect(() => {
    form.setFieldsValue({ draftBy: draftBySelectedItems });
  }, [draftBySelectedItems, form]);

  const onSelectionChanged = () => {
    if(isSubmissionItems){
      if (gridRef.current) {
        const selectedRows = gridRef.current.api.getSelectedRows();
        console.log(selectedRows);
        selectedRows.forEach(row => {
          // Set the selected submission type
          setSelectedSubmissionType(row.type);
          if (row.srrNo.includes("Rev.")) {
            const nextSrrNo = incrementSrr(row.srrNo);
            form.setFieldsValue({ srrNo: nextSrrNo });
            console.log(nextSrrNo);
            if (row.title.includes("Rev.")) {
              const nextTitle = incrementSrr(row.title);
              form.setFieldsValue({ subjectDescription: nextTitle });
            }
            else {
              // Regular expression to match "(Rev. B2)"
              const revMatch = nextSrrNo.match(/\(Rev\. [^)]+\)/);
              if (revMatch) {
                const revPart = revMatch[0];
                console.log(revPart); // Output: (Rev. B2)
                form.setFieldsValue({ subjectDescription: row.title + " " + revPart });
              } else {
                console.log("No revision found");
              }
            }
          }
          else {
            form.setFieldsValue({ subjectDescription: row.title + (" (Rev. B1)") });
            form.setFieldsValue({ srrNo: row.srrNo + (" (Rev. B1)") });
          }
  
          if (row.draftBy) {
            setDraftBySelectedItems([]);
            const drafByItem = row.draftBy.split(/\n+/).reduce((acc: any, current: any, index: any, array: any) => {
              if (index % 2 === 0) {
                acc.push({ name: current.trim() });
              } else {
                acc[acc.length - 1].title = current.trim();
              }
              return acc;
            }, []);
  
            console.log("drafByItem : ", drafByItem);
            // Iterate over each item and add it to draftBySelectedItems
            drafByItem.forEach((item: any) => {
              addDraftByOption(`${item.name} ${item.title}`);
            });
          } else {
            console.log("DraftBy data is not available.");
          }
          console.log("draftBySelectedItems : ", draftBySelectedItems);
          // Update the form field value
          form.setFieldsValue({ draftBy: draftBySelectedItems });
          form.setFieldsValue({ project: row.project });
          form.setFieldsValue({ organization: row.org });
          form.setFieldsValue({ system: row.system });
          form.setFieldsValue({ location: row.location });
          form.setFieldsValue({ type: row.type });
          form.setFieldsValue({ role: row.role });
          form.setFieldsValue({ number: row.number });
          const lastNum = row.revision;
          if (row.revision === "A1") {
            const nextAlphabeticPart = "B1";
            form.setFieldsValue({ revision: nextAlphabeticPart });
            setLastNumber(nextAlphabeticPart);
          } else {
            const nextAlphabeticPart = incrementRevision(row.revision);
            form.setFieldsValue({ revision: nextAlphabeticPart });
            setLastNumber(nextAlphabeticPart);
          }
  
        });
      }
    }else{
      if (gridRef.current) {
        const selectedRows = gridRef.current.api.getSelectedRows();
        console.log(selectedRows);
        selectedRows.forEach(row => {
          // Set the selected submission type
          setSelectedSubmissionType(row.type);         
  
          if (row.draftBy) {
            setDraftBySelectedItems([]);
            const drafByItem = row.draftBy.split(/\n+/).reduce((acc: any, current: any, index: any, array: any) => {
              if (index % 2 === 0) {
                acc.push({ name: current.trim() });
              } else {
                acc[acc.length - 1].title = current.trim();
              }
              return acc;
            }, []);
  
            console.log("drafByItem : ", drafByItem);
            // Iterate over each item and add it to draftBySelectedItems
            drafByItem.forEach((item: any) => {
              addDraftByOption(`${item.name} ${item.title}`);
            });
          } else {
            console.log("DraftBy data is not available.");
          }
          console.log("draftBySelectedItems : ", draftBySelectedItems);
          // Update the form field value
          form.setFieldsValue({ draftBy: draftBySelectedItems });
          form.setFieldsValue({ project: row.project });
          form.setFieldsValue({ organization: row.org });
          form.setFieldsValue({ system: row.system });
          form.setFieldsValue({ location: row.location });
          form.setFieldsValue({ type: row.type });
          form.setFieldsValue({ role: row.role });
          const nextNumber = String(Number(row.number) + 1).padStart(5, '0');
          form.setFieldsValue({ number: nextNumber });
          form.setFieldsValue({ revision: "A1" });  
        });
      }
    }
    
  };

  // Set the last slNo when component mounts
  useEffect(() => {
    const lastSl = getLastSlNo();
    const lastRefNo = getLastRefNo();
    setLastSlNo(lastSl);
    setLastRefNo(lastRefNo);
    setDraftByOptions(draftByOption);
    form.setFieldsValue({ sl: lastSl });
    form.setFieldsValue({ submissionRefNo: lastRefNo });
    if (!toConsultantLoading && toConsultantSubmission) {
      setRowData(toConsultantSubmission);
      setLoading(false);
    } else if (toConsultantError) {
      setErrors(toConsultantError);
      setLoading(false);
    }
  }, [getLastSlNo, draftByOption, toConsultantLoading, toConsultantSubmission, toConsultantError]);


  const { Search } = Input;

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




  const [asBuilt, setAsBuilt] = useState<string>("");
  const [constructionPlan, setConstructionPlan] = useState<string>("");
  const [drawing, setDrawing] = useState<string>("");
  const [materialApproval, setMaterialApproval] = useState<string>("");
  const [monthlyEnvironmentalReport, setMonthlyEnvironmentalReport] = useState<string>("");
  const [managementPlan, setManagementPlan] = useState<string>("");
  const [monthlyProgressReport, setMonthlyProgressReport] = useState<string>("");
  const [methodStatement, setMethodStatement] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [lastNumber, setLastNumber] = useState<string | null>(null);

  const handleIsSubmissionChange = (e: RadioChangeEvent) => {
    const value = e.target.value === 'Submission';
    setIsSubmission(value);
    setIsSubmissionItems(value);
  };





  const onSubmissionNewOrOldMenuClick: MenuProps['onClick'] = (e) => {
    const clickedItem = submissionNewOrOldMenuItems.find(item => item.key === e.key);
    if (clickedItem && clickedItem.label === 'New Submission') {
      const srrNo = getLastSrrNo();
      setLastSrrNo(srrNo);
      form.setFieldsValue({ srrNo: srrNo });
      form.setFieldsValue({ revision: "A1" });
      // Add your logic for 'New Submission' here
    } else if (clickedItem && clickedItem.label === 'Repeat Submission') {
      if (gridRef.current) {
        gridRef.current.api.deselectAll();
        gridRef.current.api.setFilterModel(null);
      }
      setDrawerOpen(true);
      console.log('Repeat Submission clicked');
      // Add your logic for 'Repeat Submission' here
    }
  };

  const submissionNewOrOldMenuItems = [
    {
      key: '1',
      label: 'New Submission',
    },
    {
      key: '2',
      label: 'Repeat Submission',
    },
  ];

  const submissionNewOrOldMenu = (
    <Menu onClick={onSubmissionNewOrOldMenuClick}>
      {submissionNewOrOldMenuItems.map(item => (
        <Menu.Item key={item.key}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );



  const submissionTypeOptions = [
    { label: 'As-Built', value: 'AB' },
    { label: 'Construction Plan', value: 'CP' },
    { label: 'Drawing', value: 'DW' },
    { label: 'Material Approval', value: 'MA' },
    { label: 'Monthly Environmental Report', value: 'MER' },
    { label: 'Management Plan', value: 'MP' },
    { label: 'Monthly Progress Report', value: 'MPR' },
    { label: 'Method Statement', value: 'MS' },
    { label: 'Report', value: 'RP' }
  ];

  const [selectedSubmissionType, setSelectedSubmissionType] = useState<string>('');


  const handleCheckboxChange = (value: string) => {
    setSelectedSubmissionType(value);
    form.setFieldsValue({ project: "DML1" });
    form.setFieldsValue({ organization: "CO" });
    form.setFieldsValue({ system: "WO" });
    form.setFieldsValue({ location: "Z01" });
    form.setFieldsValue({ type: value });
    form.setFieldsValue({ role: "W" });
    const lastNum = getLastNumberByType(value);
    form.setFieldsValue({ number: lastNum });
    if(!isSubmissionItems){
      form.setFieldsValue({ revision: "A1" });
    }
    
  };




  const [draftByAddOptionModalOpen, setDraftByAddOptionModalOpen] = useState(false);
  const [confirmDraftByAddOptionLoading, setConfirmDraftByAddOptionLoading] = useState(false);
  const [draftByAddOptionModalText, setDraftByAddOptionModalText] = useState('');
  const [newDraftByName, setNewDraftByName] = useState('');
  const [newDraftByTitle, setNewDraftByTitle] = useState('');

  const showDraftByAddOptionModal = () => {
    setDraftByAddOptionModalOpen(true);
  };

  const handleDraftByAddOptionModalOk = () => {
    setDraftByAddOptionModalText('Adding New Option');
    setConfirmDraftByAddOptionLoading(true);

    const newOption = { name: newDraftByName.trim(), title: newDraftByTitle.trim() };

    // Check for duplicates
    const isDuplicate = draftByOptions.some(option =>
      option.name === newOption.name && option.title === newOption.title
    );

    if (!isDuplicate) {
      setDraftByOptions(prevDraftByOptions => [...prevDraftByOptions, newOption]); // Update the draftByOptions state
      setTimeout(() => {
        setDraftByAddOptionModalOpen(false);
        setConfirmDraftByAddOptionLoading(false);
        setDraftByAddOptionModalText('');
        setNewDraftByName(''); // Reset the input field
        setNewDraftByTitle(''); // Reset the input field
      }, 2000);
    }

    else {
      setConfirmDraftByAddOptionLoading(false);
      setDraftByAddOptionModalText('Duplicate Item');
    }
  };



  const handleDraftByAddOptionsModalCancel = () => {
    console.log('Clicked cancel button');
    setDraftByAddOptionModalOpen(false);
  };

  const handleDraftByAddOptionsModalTitleChange = (e: { target: { value: any; }; }) => {
    const value = e.target.value;
    if (!value.startsWith('(')) {
      setNewDraftByTitle('(' + value);
      if (!value.endsWith(')')) {
        setNewDraftByTitle('(' + value + ')');
      }
    } else {
      setNewDraftByTitle(value);
    }
  };


  const [dueDate, setDueDate] = useState<moment.Moment | null>(null);

  const handleDateOfSubmissionChange = (date: moment.Moment | null) => {
    if (date) {
      const dueDateForReview = date.clone().add(28, 'days');
      setDueDate(dueDateForReview);
      form.setFieldsValue({ dueDateForReview: dueDateForReview });
    } else {
      setDueDate(null);
    }
  };

  const onDocNumChange: CheckboxProps['onChange'] = (e) => {
    console.log('checked = ', e.target.checked);
    setDocNumChecked(e.target.checked);
  };


  // Create an instance of WordEditorService
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  const downloadDocFile = async (filePath: string) => {
    const response = await fetch(`/api/doc-helper/DownloadDocfile?docfilePath=${encodeURIComponent(filePath)}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filePath;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteDocFile = async (filePath: string) => {
    try {
      const response = await fetch('/api/doc-helper/DeleteDocfile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      console.log(data.message);
    } catch (error: any) {
      console.error('Error deleting file:', error);
    }
  };

  const performFindAndReplace = async () => {
    setIsOperationInProgress(true);

    const filePath = 'SRR[SubmissionReviewRequest].docx';
    const replacements = {
      'TITLES': 'Replacement1',
      'DD MMM YYYY': 'Replacement2',
      // Add more placeholders and their replacements as needed
    };

    try {
      const response = await axios.post('/api/doc-helper/WordDocumentEditor', { filePath, replacements });
      console.log('Find and replace operation completed successfully:', response.data);
    } catch (error: any) {
      console.error('Error:', error.response?.data);
    }
    finally {
      try {
        downloadDocFile('SRR [Submission Review Request].docx');
        console.log('File Downloaded');
      } catch (error) {
        console.error('Error:', error);
      }
      finally {
        try {
          deleteDocFile('SRR [Submission Review Request].docx');
        }
        catch (error) {
          console.error('Error:', error);
        }
      }
    }
    setIsOperationInProgress(false);
  };


  const onFinish = async (values: any) => {
    console.log(values);
    // Extract the date value and format it
    const formattedDateOfSubmission = values.dateOfSubmission.format('D-MMM-YY');
    const formattedDueDateForReview = values.dueDateForReview.format('D-MMM-YY');
    console.log("formattedDateOfSubmission : ", formattedDateOfSubmission)

    const formattedDraftBy = values.draftBy.map((item: string) => {
      const [name, title] = item.split(' (');
      return `${name} \n(${title}`;
    }).join('\n');
    console.log("formattedDraftBy : ", formattedDraftBy)

    const rowNumber = parseInt(values.sl + 1);

    try {
      const values = await form.validateFields();
      console.log(values.sl);

      if(isSubmissionItems){
        console.log("isSubmissionItems (if):", isSubmissionItems);
          const response = await fetch('/api/google-drive/InsertDataToConsultatntSheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sheetName: "CSCOutgoing",
            rowNumber: rowNumber,
            rowData: {
              A: values.sl,              
              D: formattedDraftBy,
              E: values.subjectDescription,
              F: formattedDateOfSubmission,
              G: `=IF(H${values.sl + 1}>0,"Reviewed",F${values.sl + 1}+21)`,
              L: `=IF(M${values.sl + 1}="",IF(K${values.sl + 1}=0,"N/A",IF(K${values.sl + 1}=1,H${values.sl + 1}+14,IF(K${values.sl + 1}=2,"N/A",IF(K${values.sl + 1}=3,H${values.sl + 1}+21,"N/A")))),"N/A")`,
              N: `=IF(M${values.sl + 1}>0,CONCATENATE(J${values.sl + 1},"_",M${values.sl + 1}),J${values.sl + 1})`,
              S: values.project,
              T: "-",
              U: values.organization,
              V: "-",
              W: values.system,
              X: "-",
              Y: values.location,
              Z: "-",
              AA: values.type,
              AB: "-",
              AC: values.role,
              AD: "-",
              AE: "'" + values.number,
              AF: "-",
              AG: values.revision,
              AI: values.srrNo,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data.message);
        } else {
          console.log('Error inserting row data');
        }
      } else{
        if(docNumChecked){
          console.log("isSubmissionItems (else):", isSubmissionItems);
          console.log("docNumChecked (if):", docNumChecked);
          const response = await fetch('/api/google-drive/InsertDataToConsultatntSheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sheetName: "CSCOutgoing",
            rowNumber: rowNumber,
            rowData: {
              A: values.sl,
              B: values.submissionRefNo,
              D: formattedDraftBy,
              E: values.subjectDescription,
              F: formattedDateOfSubmission,
              G: `=IF(H${values.sl + 1}>0,"Reviewed",F${values.sl + 1}+21)`,
              L: `=IF(M${values.sl + 1}="",IF(K${values.sl + 1}=0,"N/A",IF(K${values.sl + 1}=1,H${values.sl + 1}+14,IF(K${values.sl + 1}=2,"N/A",IF(K${values.sl + 1}=3,H${values.sl + 1}+21,"N/A")))),"N/A")`,
              N: `=IF(M${values.sl + 1}>0,CONCATENATE(J${values.sl + 1},"_",M${values.sl + 1}),J${values.sl + 1})`,
              S: values.project,
              T: "-",
              U: values.organization,
              V: "-",
              W: values.system,
              X: "-",
              Y: values.location,
              Z: "-",
              AA: values.type,
              AB: "-",
              AC: values.role,
              AD: "-",
              AE: "'" + values.number,
              AF: "-",
              AG: values.revision,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data.message);
        } else {
          console.log('Error inserting row data');
        }
        }
        else{
          console.log("isSubmissionItems (else):", isSubmissionItems);
          console.log("docNumChecked (else):", docNumChecked);
          const response = await fetch('/api/google-drive/InsertDataToConsultatntSheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sheetName: "CSCOutgoing",
            rowNumber: rowNumber,
            rowData: {
              A: values.sl,
              B: values.submissionRefNo,
              D: formattedDraftBy,
              E: values.subjectDescription,
              F: formattedDateOfSubmission,
              G: `=IF(H${values.sl + 1}>0,"Reviewed",F${values.sl + 1}+21)`,
              L: `=IF(M${values.sl + 1}="",IF(K${values.sl + 1}=0,"N/A",IF(K${values.sl + 1}=1,H${values.sl + 1}+14,IF(K${values.sl + 1}=2,"N/A",IF(K${values.sl + 1}=3,H${values.sl + 1}+21,"N/A")))),"N/A")`,
              N: `=IF(M${values.sl + 1}>0,CONCATENATE(J${values.sl + 1},"_",M${values.sl + 1}),J${values.sl + 1})`,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data.message);
        } else {
          console.log('Error inserting row data');
        }
        }
      }      
    } 
    catch (error) {
      console.log('Error inserting row data:', error);
    } 
    finally{
      try{        
        fetchData();
      }
      catch(error){
        console.log("error : ", error);
      }
      finally{
        form.resetFields();
        try{
          performFindAndReplace();
        }
        catch(error){
          console.log(error)
        }
      }
    }
  };

  return (
    <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        
        className="max-w-[100vW]"
        initialValues={{ selectedOption: selectedValue }}
      >

        <Form.Item >
          <Radio.Group onChange={handleIsSubmissionChange} defaultValue="General Correspondence">
            <Radio.Button value="General Correspondence">General Correspondence</Radio.Button>
            <Radio.Button value="Submission">Submission</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <div className="max-h-[72vh] overflow-y-auto p-4">
          <Form.Item
            label="SL."
            name="sl"
            rules={[{ required: true, message: 'Please input SL.' }]}
            initialValue={lastSlNo !== null ? lastSlNo.toString() : ''}
          >
            <Input placeholder="Sl/No." readOnly />
          </Form.Item>

          {isSubmissionItems ?
            (
              <>
                <Form.Item
                  label="Submission Review Request (SRR)"
                  name="srrNo"
                  rules={[{ required: true, message: 'Please input Submission Ref. No.' }]}

                >
                  <div className="flex items-start w-full">
                    <Form.Item name="srrNo" noStyle>
                      <Input placeholder="Submission Review Request (SRR)" readOnly />
                    </Form.Item>
                    <Tooltip title="New Or Repeat Submission ??">
                      <Dropdown.Button type="dashed" className="max-w-[80px]" overlay={submissionNewOrOldMenu}>
                        <AiOutlineInfoCircle size={16} className="opacity-45" />
                      </Dropdown.Button>
                    </Tooltip>
                  </div>
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  label="Letter Ref. No."
                  name="submissionRefNo"
                  rules={[{ required: true, message: 'Please input Submission Ref. No.' }]}
                >
                  <Input placeholder="Letter Ref. No." readOnly />
                </Form.Item>
              </>
            )
          }
          <Space.Compact className="flex w-full">
            <Form.Item
              className='w-full'
              label="Draft By"
              name="draftBy"
              rules={[{ required: true, message: 'Please input Draft By' }]}
            >
              <Select
                mode="multiple"
                placeholder="Draft By"
                value={draftBySelectedItems}
                onChange={handleDraftByChange}
                className="w-full"
              >
                {draftByFilteredOptions.map((item) => (
                  <Select.Option key={`${item.name} ${item.title}`} value={`${item.name} ${item.title}`}>
                    <div>
                      {item.name}
                      <br />
                      {item.title}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label=" ">
              <Button className='mt-[1px] h-[31px] -ms-[1px]' onClick={showDraftByAddOptionModal}>
                <MdAdd />
              </Button>
              <Modal
                centered
                title="Add New Draft By Option"
                open={draftByAddOptionModalOpen}
                onOk={handleDraftByAddOptionModalOk}
                confirmLoading={confirmDraftByAddOptionLoading}
                onCancel={handleDraftByAddOptionsModalCancel}
                maskClosable={false}
              >
                <Form>
                  <Form.Item label="Name" rules={[{ required: true, message: 'Please insert name' }]}>
                    <Input
                      placeholder="Insert Name"
                      value={newDraftByName}
                      onChange={(e) => setNewDraftByName(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="Title" rules={[{ required: true, message: 'Please insert title' }]}>
                    <Input
                      placeholder="Insert Title"
                      value={newDraftByTitle}
                      onChange={handleDraftByAddOptionsModalTitleChange}
                    />
                  </Form.Item>
                </Form>
                <p>{draftByAddOptionModalText}</p>
              </Modal>
            </Form.Item>
          </Space.Compact>

          <Form.Item
            label="Subject/ Description"
            name="subjectDescription"
            rules={[{ required: true, message: 'Please input Subject/ Description' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Date of Submission"
            name="dateOfSubmission"
            rules={[{ required: true, message: 'Please select Date of Submission' }]}
          >
            <DatePicker className="w-full" format="D-MMM-YY" onChange={handleDateOfSubmissionChange} />
          </Form.Item>

          <Form.Item
            label="Due Date for Review"
            name="dueDateForReview"
            rules={[{ required: true, message: 'Please select Due Date for Review' }]}
          >
            <DatePicker className="w-full" format="D-MMM-YY" value={dueDate} readOnly />
          </Form.Item>
          {isSubmissionItems ? (
            <>
              <Form.Item
                label="Submission Type :"
                name="selectedOption"
                rules={[{ required: true, message: 'Please set Submission Type' }]}>
                <div className="flex flex-wrap">
                  {submissionTypeOptions.map(option => (
                    <Checkbox
                      key={option.value}
                      value={option.value}
                      checked={selectedSubmissionType === option.value}
                      onChange={() => handleCheckboxChange(option.value)}
                    >
                      {option.label}
                    </Checkbox>
                  ))}
                </div>
              </Form.Item>

              <Form.Item label={<><span className="form-item-inline-block-custom">Document / Drawing Number</span></>}>
                <Space.Compact className='flex flex-wrap p-1 bg-slate-50 rounded-md border-dotted border-2 border-[#d9d9d9]'>
                  <Form.Item
                    name="project"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the project name!' }]}
                  >
                    <Input placeholder="Project" addonAfter={"-"} />
                  </Form.Item>


                  <Form.Item
                    name="organization"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the organization!' }]}
                  >
                    <Input placeholder="Organization" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="system"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the system!' }]}
                  >
                    <Input placeholder="System" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="location"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the location!' }]}
                  >
                    <Input placeholder="Location" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="type"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the type!' }]}
                  >
                    <Input placeholder="Type" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the role!' }]}
                  >
                    <Input placeholder="Role" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="number"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the number!' }]}
                  >
                    <Input placeholder="Number" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="revision"
                    rules={[{ required: true, message: 'Please input the revision!' }]}
                  >
                    <Input placeholder="Revision" />
                  </Form.Item>

                </Space.Compact>

              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
              className="-mb-[15px]"
                label={
                  <>
                    <Checkbox checked={docNumChecked} onChange={onDocNumChange}>
                      {"Set Document Number"}
                    </Checkbox>
                  </>
                }
                tooltip={{
                  title: 'Tooltip with customize icon',
                  icon: <>{docNumChecked ? (<FcInfo className="cursor-pointer" size={24} 
                  onClick={(event) => { 
                    event.preventDefault(); 
                    console.log('Button clicked!'); 
                    if (gridRef.current) {
                      gridRef.current.api.deselectAll();
                      gridRef.current.api.setFilterModel(null);
                    }
                    setDrawerOpen(true);
                  }
                }/>) : (<></>) }</>
                }}
              >
              </Form.Item>

              {docNumChecked ?
                (
                  <>
              <Form.Item
                label="Submission Type :"
                name="selectedOption"
                rules={[{ required: true, message: 'Please set Submission Type' }]}>
                <div className="flex flex-wrap">
                  {submissionTypeOptions.map(option => (
                    <Checkbox
                      key={option.value}
                      value={option.value}
                      checked={selectedSubmissionType === option.value}
                      onChange={() => handleCheckboxChange(option.value)}
                    >
                      {option.label}
                    </Checkbox>
                  ))}
                </div>
              </Form.Item>

              <Form.Item label={<><span className="form-item-inline-block-custom">Document / Drawing Number</span></>}>
                <Space.Compact className='flex flex-wrap p-1 bg-slate-50 rounded-md border-dotted border-2 border-[#d9d9d9]'>
                  <Form.Item
                    name="project"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the project name!' }]}
                  >
                    <Input placeholder="Project" addonAfter={"-"} />
                  </Form.Item>


                  <Form.Item
                    name="organization"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the organization!' }]}
                  >
                    <Input placeholder="Organization" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="system"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the system!' }]}
                  >
                    <Input placeholder="System" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="location"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the location!' }]}
                  >
                    <Input placeholder="Location" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="type"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the type!' }]}
                  >
                    <Input placeholder="Type" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the role!' }]}
                  >
                    <Input placeholder="Role" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="number"
                    className="mb-[2px]"
                    rules={[{ required: true, message: 'Please input the number!' }]}
                  >
                    <Input placeholder="Number" addonAfter={"-"} />
                  </Form.Item>

                  <Form.Item
                    name="revision"
                    rules={[{ required: true, message: 'Please input the revision!' }]}
                  >
                    <Input placeholder="Revision" />
                  </Form.Item>

                </Space.Compact>

              </Form.Item>
            </>

                ) :
                (
                  <></>
                )
              }
            </>
          )}
        </div>
        <Form.Item>
        <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Drawer
        size="large"
        title="List Of Submission"
        placement="right"
        closable={true}
        onClose={onDrawerClose}
        open={drawerOpen}
      >
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Spin spinning={toConsultantLoading} size="large">
            <div className="w-full h-[82.75vh]">
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
                  ref={gridRef}
                  columnDefs={columnDefs}
                  rowData={rowData}
                  rowSelection={'single'}
                  enableCellTextSelection={true}
                  gridOptions={agGridOptions}
                  onGridReady={onGridReady}
                  onPaginationChanged={onPageChanged}
                  onSelectionChanged={onSelectionChanged}
                />
              </div>
              <Button className="mt-2" type="primary" htmlType="submit" onClick={onDrawerCloseByButtonCLick}>
                Set Sequence
              </Button>
            </div>
          </Spin>
        </div>
      </Drawer>
    </div>
  );
};

export default ToConsultantNew;
