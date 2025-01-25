import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Card, Select, Radio } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { DocHistoryUseData } from '../classes/DocHistoryDataProvider';
import { ToConsultantUseData } from '../classes/ToConsultantDataProvider';
import moment from 'moment';
import { FromConsultantUseData } from '../classes/FromConsultantDataProvider';
import { FromEmployerUseData } from '../classes/FromEmployerDataProvider';

type FilterFunc<OptionType> = (input: string, option: OptionType) => boolean;

const DocumentHistory: React.FC = () => {

    const [isVisible, setIsVisible] = useState(false);
    const { fetchDocHistoryData, getLastUniqueRef } = DocHistoryUseData();
    const [lastUniqueNo, setLastUniqueNo] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [_, setForceRender] = useState(false); // State to force re-render
    const { getAllSortedRefNoAndSrrNo, getSubmissionByRefNoOrSrrNo } = ToConsultantUseData();
    const { getSubmissionByRefNoConsultant, getAllSortedRefNoConsultant, } = FromConsultantUseData();
    const { getSubmissionByRefNoEmployer, getAllSortedRefNoEmployer, } = FromEmployerUseData();
    const [allSortedRefNoAndSrrNo, setAllSortedRefNoAndSrrNo] = useState<{ refNos: string[], srrNos: string[] }>({ refNos: [], srrNos: [] });
    const [allSortedRefNoConsultatnt, setAllSortedRefNoConsultatnt] = useState<{ refNos: string[] }>({ refNos: [] });
    const [allSortedRefNoEmployer, setAllSortedRefNoEmployer] = useState<{ refNos: string[] }>({ refNos: [] });
    const [referenceNoOptions, setReferenceNoOptions] = useState<{ value: string, label: string }[]>([]);
    const [searchReferenceNoOptions, setSearchReferenceNoOptions] = useState('');
    const [senderOptions, setSenderOptions] = useState('');

    const filterOption = (input: string, option?: { label: string; value: string }) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    const handleAdd = (add: (defaultValue?: any, insertIndex?: number | undefined) => void) => {
        add({});
        updateSequence();
    };

    const handleRemove = (remove: (name: number | number[]) => void, name: number) => {
        remove(name);
        updateSequence();
    };

    const updateSequence = () => {
        const items = form.getFieldValue('items') || [];

        const updatedItems = items.map((item: any, index: number) => ({
            ...item,
            sequence: index + 1,
            uniqueRef: getLastUniqueRef(),
        }));
        form.setFieldsValue({ items: updatedItems });
    };

    const onFieldsChange = () => {
        updateSequence();
    };

    const handleRefNoChange = (newValue: string) => {
        const items = form.getFieldValue('items') || [];

        const updatedItems = items.map((item: any, index: number) => ({
            ...item,
            referenceNo: getLastUniqueRef(),
        }));
        form.setFieldsValue({ items: updatedItems });
    };

    const handleSenderSelectChange = (value: string, index: number) => {
        if (value !== undefined && value !== null) {
            console.log('Selected value:', value);
            setSenderOptions(value);

            // Clear the referenceNoOptions first
            setReferenceNoOptions([]);
            if (value === 'Contractor') {
                const allSortedRefNoAndSrrNoData = getAllSortedRefNoAndSrrNo();
                setAllSortedRefNoAndSrrNo(allSortedRefNoAndSrrNoData);
                console.log(allSortedRefNoAndSrrNo);

                const items = form.getFieldValue('items') || [];

                const updatedItems = items.map((item: any, idx: number) => {
                    if (index === idx) {
                        return {
                            ...item,
                            sender: value, // Update the sender value
                            referenceNoOptions: [...allSortedRefNoAndSrrNoData.refNos, ...allSortedRefNoAndSrrNoData.srrNos].map((item) => ({ value: item, label: item }))
                        };
                    }
                    return item;
                });

                form.setFieldsValue({ items: updatedItems });
                setReferenceNoOptions([...allSortedRefNoAndSrrNoData.refNos, ...allSortedRefNoAndSrrNoData.srrNos].map((item) => ({ value: item, label: item })));
            } else if (value === 'Consultant') {
                console.log('Selected value:', value);
                const allSortedRefNoConsultatnt = getAllSortedRefNoConsultant();
                setAllSortedRefNoConsultatnt(allSortedRefNoConsultatnt);
                console.log("allSortedRefNoConsultatnt : ", allSortedRefNoConsultatnt);

                const items = form.getFieldValue('items') || [];

                const updatedItems = items.map((item: any, idx: number) => {
                    if (index === idx) {
                        return {
                            ...item,
                            sender: value, // Update the sender value
                            referenceNoOptions: [...allSortedRefNoConsultatnt.refNos].map((item) => ({ value: item, label: item }))
                        };
                    }
                    return item;
                });

                form.setFieldsValue({ items: updatedItems });
                setReferenceNoOptions([...allSortedRefNoConsultatnt.refNos].map((item) => ({ value: item, label: item })));
            }
            else if (value === 'Employer') {
                console.log('Selected value:', value);
                const allSortedRefNoEmployer = getAllSortedRefNoEmployer();
                setAllSortedRefNoEmployer(allSortedRefNoEmployer);
                console.log("allSortedRefNoEmployer : ", allSortedRefNoEmployer);

                const items = form.getFieldValue('items') || [];

                const updatedItems = items.map((item: any, idx: number) => {
                    if (index === idx) {
                        return {
                            ...item,
                            sender: value, // Update the sender value
                            referenceNoOptions: [...allSortedRefNoEmployer.refNos].map((item) => ({ value: item, label: item }))
                        };
                    }
                    return item;
                });

                form.setFieldsValue({ items: updatedItems });
                setReferenceNoOptions([...allSortedRefNoEmployer.refNos].map((item) => ({ value: item, label: item })));
            }
        }
        else {
            console.log('No value selected or value is invalid');
        }
    };


    const handleReferenceNoOptionsSearch = (value: string) => {
        setSearchReferenceNoOptions(value);
        if (senderOptions === 'Contractor') {
            const refNosFiltered = allSortedRefNoAndSrrNo.refNos.filter((item: string) => item.toLowerCase().includes(value.toLowerCase()));
            const srrNosFiltered = allSortedRefNoAndSrrNo.srrNos.filter((item: string) => item.toLowerCase().includes(value.toLowerCase()));
            const filteredOptions = [...refNosFiltered, ...srrNosFiltered];
            setReferenceNoOptions(filteredOptions.map((item: string) => ({ value: item, label: item })));
        } else if (senderOptions === 'Consultant') {
            const refNosFiltered = allSortedRefNoConsultatnt.refNos.filter((item: string) => item.toLowerCase().includes(value.toLowerCase()));
            const filteredOptions = [...refNosFiltered];
            setReferenceNoOptions(filteredOptions.map((item: string) => ({ value: item, label: item })));
        }
        else if (senderOptions === 'Employer') {
            const refNosFiltered = allSortedRefNoEmployer.refNos.filter((item: string) => item.toLowerCase().includes(value.toLowerCase()));
            const filteredOptions = [...refNosFiltered];
            setReferenceNoOptions(filteredOptions.map((item: string) => ({ value: item, label: item })));
        }

    };

    const handleReferenceNoChange = (value: any, index: number) => {
        console.log(`Selected reference no: ${value}`);
        if (senderOptions === 'Contractor') {
            const submission = getSubmissionByRefNoOrSrrNo(value);
            if (submission) {
                const items = form.getFieldValue('items') || [];

                const updatedItems = items.map((item: any, idx: number) => {
                    if (index === idx) {
                        const fn_date = moment(submission.subDate, "D-MMM-YY");
                        return {
                            ...item,
                            title: submission.title,
                            date: fn_date,
                        };
                    }
                    return item;
                });

                form.setFieldsValue({ items: updatedItems });
                setForceRender(prev => !prev); // Force a re-render
            } else {
                console.log('No submission found');
            }
        } 
        else if (senderOptions === 'Consultant') {
            const submission = getSubmissionByRefNoConsultant(value);
            if (submission) {
                const items = form.getFieldValue('items') || [];

                const updatedItems = items.map((item: any, idx: number) => {
                    if (index === idx) {
                        const fn_date = moment(submission.date, "D-MMM-YY");
                        return {
                            ...item,
                            title: submission.title,
                            date: fn_date,
                        };
                    }
                    return item;
                });

                form.setFieldsValue({ items: updatedItems });
                setForceRender(prev => !prev); // Force a re-render
            }
             else {
                console.log('No submission found');
            }
        }
        else if (senderOptions === 'Employer') {
            const submission = getSubmissionByRefNoEmployer(value);
            if (submission) {
                const items = form.getFieldValue('items') || [];

                const updatedItems = items.map((item: any, idx: number) => {
                    if (index === idx) {
                        const fn_date = moment(submission.date, "D-MMM-YY");
                        return {
                            ...item,
                            title: submission.title,
                            date: fn_date,
                        };
                    }
                    return item;
                });

                form.setFieldsValue({ items: updatedItems });
                setForceRender(prev => !prev); // Force a re-render
            }
             else {
                console.log('No submission found');
            }
        }
    };

    function incrementSequence(sequence: string): string {
        const parts = sequence.split('-');
        if (parts.length !== 2) {
            throw new Error('Invalid sequence format');
        }

        const numericPart = parseInt(parts[1], 10);
        if (isNaN(numericPart)) {
            throw new Error('Numeric part of sequence is not a valid number');
        }

        // Increment the numeric part
        const incrementedNumericPart = numericPart + 1;

        // Format the incremented numeric part with leading zeros if needed
        const formattedNumericPart = String(incrementedNumericPart).padStart(parts[1].length, '0');

        // Concatenate the non-numeric part with the formatted numeric part
        return `${parts[0]}-${formattedNumericPart}`;
    }

    const onFinish = async (values: any) => {
        console.log('Form items:', values.items);

        // Log individual items
        values.items.forEach((item: any, index: number) => {
            console.log(`Item ${index}:`, item);
            console.log(`Item ${index} referenceNo:`, item.referenceNo);
        });

        // Log the entire array
        console.log('Items array:', values.items);

        // Prepare selective data
        const selectiveData = values.items.map((item: any) => {
            const formattedDateOfSubmission = item.date.format('D-MMM-YY');
            return {
                A: item.uniqueRef,
                B: item.sequence,
                C: item.title,
                D: item.referenceNo,
                E: formattedDateOfSubmission,
                F: item.sender,
                G: item.comment,
                H: item.remarks,
                // Add other properties you want to include here
                // propertyName: item.propertyName,
            };
        });

        try {
            const response = await fetch('/api/google-drive/InsertDataToDocHistorySheet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sheetName: 'LetterHistory', // Replace with your actual sheet name
                    rowData: selectiveData,
                }),
            });

            const result = await response.json();
            console.log(result);
            if (response.ok) {
                form.resetFields();
            } else {
                console.error('Error inserting data:', result.error);
            }
        } catch (error) {
            console.error('Error in onFinish:', error);
        } finally {
            try {
                fetchDocHistoryData();
                setLastUniqueNo(getLastUniqueRef());
            } catch (error) {
                console.log("error :", error);
            } finally {
                const nextSequence = lastUniqueNo ? incrementSequence(lastUniqueNo) : null;
                if (nextSequence !== null) {
                    const items = form.getFieldValue('items') || [];

                    const updatedItems = items.map((item: any, index: number) => ({
                        ...item,
                        sequence: index + 1,
                        uniqueRef: nextSequence,
                    }));
                    form.setFieldsValue({ items: updatedItems });
                } else {
                    console.error('lastUniqueNo is null');
                }
            }
        }
    };



    useEffect(() => {
        setIsVisible(true);
        setLastUniqueNo(getLastUniqueRef());
        updateSequence();
    }, [lastUniqueNo]);


    return (
        <div className={`transition-opacity h-full duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Form
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 24 }}
                form={form}
                name="dynamic_form_complex"
                className="max-w-[100vW] h-full"
                autoComplete="off"
                initialValues={{ items: [{}] }}
                onFieldsChange={onFieldsChange}
                onFinish={onFinish} // Add this line
            >
                <div className="max-h-[88vh] overflow-y-auto p-4">
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <div className="flex flex-col gap-2">
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Card
                                        size="small"
                                        title={`History Flow : ${name + 1}`}
                                        key={key}
                                        extra={
                                            key === 0 ? (
                                                <></>
                                            ) : (
                                                <MinusCircleOutlined
                                                    onClick={() => handleRemove(remove, name)}
                                                />
                                            )
                                        }
                                    >
                                        <Form.Item
                                            {...restField}
                                            label="Unique Ref."
                                            name={[name, 'uniqueRef']}
                                            rules={[{ required: true, message: 'Missing Unique Ref.' }]}
                                        >
                                            <Input placeholder="Unique Ref." defaultValue={"MRTL1CP01-HIS-REF"} readOnly />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Sequence No."
                                            name={[name, 'sequence']}
                                            rules={[{ required: true, message: 'Missing Sequence' }]}
                                        >
                                            <Input placeholder="Sequence" readOnly />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Sender"
                                            name={[name, 'sender']}
                                            rules={[{ required: true, message: 'Missing Sender' }]}
                                        >
                                            <Select
                                                placeholder="Sender"
                                                filterOption={
                                                    (input: string, option?: { label: string; value: string }) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                }
                                                showSearch
                                                allowClear
                                                options={[
                                                    { value: 'Contractor', label: 'Contractor' },
                                                    { value: 'Consultant', label: 'Consultant' },
                                                    { value: 'Employer', label: 'Employer' },
                                                    { value: 'Other', label: 'Other' },
                                                ]}
                                                onChange={(value) => handleSenderSelectChange(value, index)} // Pass index to the handler
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Reference No."
                                            name={[name, 'referenceNo']}
                                            rules={[{ required: true, message: 'Missing Reference No.' }]}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="Reference No."
                                                defaultActiveFirstOption={false}
                                                suffixIcon={null}
                                                filterOption={true}
                                                onSearch={handleReferenceNoOptionsSearch}
                                                notFoundContent={null}
                                                options={referenceNoOptions}
                                                onChange={(value) => handleReferenceNoChange(value, index)} // Pass index to the handler
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Title"
                                            name={[name, 'title']}
                                            rules={[{ required: true, message: 'Missing Title' }]}
                                        >
                                            <Input placeholder="Title" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Date"
                                            name={[name, 'date']}
                                            rules={[{ required: true, message: 'Missing Date' }]}
                                        >
                                            <DatePicker format="D-MMM-YY" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Comment"
                                            name={[name, 'comment']}
                                        >
                                            <Input placeholder="Comment" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            label="Remarks"
                                            name={[name, 'remarks']}
                                        >
                                            <Input placeholder="Remarks" />
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Button
                                    type="dashed"
                                    className=""
                                    onClick={() => handleAdd(add)}
                                    block
                                >
                                    + Add History
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </div>
                <Form.Item>
                    <div className="flex flex-row-reverse max-w-[100vW]">
                        <Button className="mt-1 mr-8 " type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </div>                    
                </Form.Item>
            </Form>
        </div>
    );
};

export default DocumentHistory;
