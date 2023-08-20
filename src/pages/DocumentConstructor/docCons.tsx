import React, { useEffect, useState, useRef } from 'react';
import Axios from 'axios';
import './docCons.scss'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Input from '@mui/material/Input'
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { ButtonGroup, Checkbox, FormControlLabel, FormGroup, ListSubheader } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import Collapse from '@mui/material/Collapse';
import { el } from 'date-fns/locale';
import { isEqual } from 'date-fns';
import { green } from '@mui/material/colors';
import { templateFilter, templateTagValidator } from 'src/helper'
import { useMutation } from 'urql'
import Modal from 'src/components/Modal/Modal'
import LoaderView from 'src/components/LoaderView/LoaderView'



const testConstructorSignNow = `mutation testConstructorSignNow($dealId: UUID, $adId: UUID, $docType: String!, $role: String) {
    testConstructorSignNow(dealId: $dealId, adId: $adId, docType: $docType, role: $role) {
        runtimeError {
            exception
            message
        }
        fieldErrors {
            field
            message
        }
        file {
            id
            file
            filename
            link
            inviteLink
        }
        text
        message
    }
}`


const baseUrl = `https://${process.env.BACKEND_URL}/constr/`

const DocumentConstructor: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<any>();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [htmlFromServer, setHtmlFromServer] = useState('');
    const [oldPlaceHolder, setOldPlaceHolder] = useState('');
    const [newPlaceHolder, setNewPlaceHolder] = useState('');
    const [placeholderVars, setPlaceholderVars] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [isCreate, setIsCreate] = useState(true);
    const [templateName, setTemplateName] = useState('');
    const [templateVersion, setTemplateVersion] = useState('');
    const [templateId, setTemplateId] = useState<any>();
    const [emptySample, setEmptySample] = useState('');
    const [templateType, setTemplateType] = useState('');
    const [templateStatus, setTemplateStatus] = useState(false);
    const [godMode, setGodMode] = useState(false);
    const [testDocumentData, testDocument] = useMutation(testConstructorSignNow)
    const [validationData, setValidationData] = useState<any>();
    const [templateValidation, setTemplateValidation] = useState<any>();
    const [checkModal, setCheckModal] = useState<boolean>(false);
    const [inactiveModal, setInactiveModal] = useState<boolean>(false);

    const ref = useRef();

    useEffect(() => {
        fetchPlaceHolders(),
            getTemplates()
    }, [])


    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);

    };

    const handleSubmission = async () => {
        const formData = new FormData();
        formData.append('file', selectedFile)
        Axios.post(baseUrl + "convert/", formData)
            .then((res) => {
                setHtmlFromServer(templateFilter(res.data))
                setEmptySample(templateFilter(res.data))
                setIsCreate(true)
            })
            .catch((err) => console.error(err))
    };

    const fetchPlaceHolders = () => {
        Axios.get(baseUrl + "deal-metadata/").then((res) => {
            const unnamedPlaceholders = res.data.filter((e) => e.hasOwnProperty('helpText'))
            const unnamed = [{ name: 'unknown', fields: [...unnamedPlaceholders] }]
            const resultList = unnamed.concat(res.data.filter((e) => e.hasOwnProperty('fields')));
            setPlaceholderVars(resultList)
        }).catch((err) => console.error(err))
    }

    const handleOldPlaceHolder = (event) => {
        setOldPlaceHolder(event.target.value)
    }

    const handleNewPlaceHolder = (event) => {
        setNewPlaceHolder(event.target.value)
    }

    const showPlaceHolder = () => {
        let newHtml = htmlFromServer.split(oldPlaceHolder).join(newPlaceHolder);
        setHtmlFromServer(newHtml)
    }



    const resetDoc = (ref) => {
        setHtmlFromServer('')
        setTemplateName('');
        setTemplateVersion('');
        setTemplateId('');
        setSelectedFile({});
        setIsCreate(true)
        setTemplateType('');
        setTemplateStatus(false);
        ref.current.value = '';
    }

    const getTemplates = () => {
        Axios.get(baseUrl).then((res) => {
            console.log('templates', res)
            setTemplates([...res.data])
        }).catch((e) => console.error(e))
    }

    const deleteTemplate = () => {
        Axios.delete(baseUrl + templateId + '/').catch((err) => console.error(err))
        resetDoc(ref)
        getTemplates()
    }

    const updateTemplate = () => {
        const filteredHTML = templateFilter(htmlFromServer)
        const data = {
            name: templateName,
            version: templateVersion,
            type: templateType,
            empty_sample: emptySample,
            data_sample: filteredHTML,
            is_active: templateStatus,
        }
        //setHtmlFromServer(filteredHTML)
        Axios.put(baseUrl + templateId + '/', data).then(() => {
            getTemplates()
            //setHtmlFromServer(filteredHTML)
        }).catch((err) => console.error(err))
    }

    const getSignerByDocType = () => {
        switch (templateType) {
            case 'PO': return 'SELLER'
            case 'BS': return 'SELLER'
            default: return 'BUYER'
        }
        return 'BUYER'
    }


    const checkTemplate = () => {
        if (templateStatus) {
            const filteredHTML = templateFilter(htmlFromServer)
            setTemplateValidation(templateTagValidator(filteredHTML))
            setValidationData(null)
            setCheckModal(true)
            testDocument({
                adId: templateType == 'PO' ? process.env.DOC_CONS_AD : null,
                dealId: templateType == 'PO' ? null : process.env.DOC_CONS_DEAL,
                docType: templateType,
                role: getSignerByDocType()
            }).then(res => {
                if (res?.data?.testConstructorSignNow) {
                    const result = res?.data?.testConstructorSignNow
                    setValidationData(result)
                }
            })
        } else {
            setInactiveModal(true)
        }
    }

    const createNewTemplate = () => {
        const filteredHTML = templateFilter(htmlFromServer)
        const data = {
            name: templateName,
            version: templateVersion,
            type: templateType,
            empty_sample: emptySample,
            data_sample: filteredHTML,
            is_active: templateStatus,
        }
        Axios.post(baseUrl, data).then((res) => {
            getTemplates()
        }
        ).catch((err) => console.error(err))
    }

    const showValue = (id) => {
        const template = templates.filter((el) => el.id === id)[0];
        console.log('template', template)
        setHtmlFromServer(template.data_sample)
        setTemplateName(template.name);
        setTemplateVersion(template.version);
        setTemplateId(template.id);
        setEmptySample(template.empty_sample);
        setTemplateStatus(template.is_active);
        setTemplateType(template.type);
        setIsCreate(false)
    }

    const handleTemplateName = (event) => {
        setTemplateName(event.target.value);
    }

    const handleTemplateVersion = (event) => {
        setTemplateVersion(event.target.value)
    }

    const handleTemplateTypeChange = (event) => {
        setTemplateType(event.target.value)
    }

    const toggleTemplateStatus = () => {
        setTemplateStatus(!templateStatus)
    }

    const Item = (props) => {

        const [open, setOpen] = useState(false);
        const [node, setNode] = useState(props.el)
        const handleClick = () => {
            setOpen(!open);

        }

        if (node.hasOwnProperty('fields')) {
            return (
                <>
                    <ListItemButton onClick={handleClick}>
                        <ListItemText primary={node.name} sx={{ color: 'blue' }} />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        {node.fields.map((el, i) => <Item key={i} el={el} />)}
                    </Collapse>

                </>
            )
        }
        return <>
            <ListItem key={`${node.name} list`} >

                <ListItemText primary={`${node.name}:${node.helpText}`} />
            </ListItem>
        </>



    }

    const renderPlaceholers = (placeHolders) => {
        if (placeHolders) {
            return (<>{placeHolders.map((el, i) => <Item key={i} el={el} />)}</>)
        }
    }



    return (
        <div className={`ddoc-wrapper__doc-wrapper ${godMode ? 'godMode' : 'viewMode'}`}>
            <div className="ddoc-wrapper__left-col">
                <div className="ddoc-wrapper__file-wrapper">
                    <div>
                        <div>
                            <Input color='info' type="file" name="file" onChange={changeHandler} inputRef={ref} />
                        </div>
                        {isFilePicked ? (
                            <div className='ddoc-wrapper__after-upload'>
                                <Button onClick={handleSubmission}>Upload</Button>
                                <Button onClick={() => resetDoc(ref)}>Clear</Button>
                            </div>
                        ) : null}
                    </div>
                    <div className="ddoc-wrapper__temlates-wrap">
                        Templates
                        {templates ?
                            <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {templates.map((el) => {
                                    const labelId = `checkbox-list-secondary-label-${el.id}`;
                                    return (
                                        <ListItem
                                            key={el.id}
                                            secondaryAction={
                                                <Checkbox edge='end' checked={el.is_active} disabled />
                                            }
                                            disablePadding
                                        >
                                            <ListItemButton onClick={() => showValue(el.id)}>
                                                <ListItemText id={labelId} primary={el.name}></ListItemText>
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                })}
                            </List> : '  No templates yet'}
                    </div>
                </div>
                <div className="ddoc-wrapper__editing">
                    <div className='ddoc-wrapper__switch-fields'>
                        <div className='ddoc-wrapper__fields'>
                            <TextField size='small' label="oldPlaceHolder" onChange={handleOldPlaceHolder} />
                        </div>
                        <div className='ddoc-wrapper__fields'>
                            <TextField size='small' label="newPlaceHolder" onChange={handleNewPlaceHolder} />
                        </div>
                    </div>
                    <div className='ddoc-wrapper__fields'>
                        <Button size='small' onClick={showPlaceHolder} variant="contained" color='success'>Switch</Button>
                    </div>
                    <div className='ddoc-wrapper__fields'>
                        <TextField size='small' InputProps={{
                            startAdornment: <InputAdornment position="start">Name:</InputAdornment>,
                        }} value={templateName} onChange={handleTemplateName} />
                    </div>
                    <div>
                        <TextField size='small' InputProps={{
                            startAdornment: <InputAdornment position="start">Version:</InputAdornment>,
                        }} value={templateVersion} onChange={handleTemplateVersion} />
                    </div>
                    <div className='ddoc-wrapper__fields'>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Template type</InputLabel>
                            <Select
                                size='small'
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={templateType}
                                label="Template type"
                                onChange={handleTemplateTypeChange}
                            >
                                <MenuItem value={'AM'}>Amendment</MenuItem>
                                <MenuItem value={'TR'}>TAL</MenuItem>
                                <MenuItem value={'TW'}>TAL with discr</MenuItem>
                                <MenuItem value={'PA'}>Aircraft purchase agreement</MenuItem>
                                <MenuItem value={'WA'}>Warranty assignment</MenuItem>
                                <MenuItem value={'RS'}>Release to service</MenuItem>
                                <MenuItem value={'IP'}>Inspection report</MenuItem>
                                <MenuItem value={'RL'}>Rejection letter</MenuItem>
                                <MenuItem value={'LI'}>Letter of intent</MenuItem>
                                <MenuItem value={'DR'}>Delivery receipt</MenuItem>
                                <MenuItem value={'BS'}>Bill of sale</MenuItem>
                                <MenuItem value={'PO'}>Public offer</MenuItem>
                                <MenuItem value={'CC'}>Closing Instruction Crypto</MenuItem>
                                <MenuItem value={'CF'}>Closing Instruction Fiat</MenuItem>
                            </Select>
                        </FormControl>

                    </div>
                    <div >
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={templateStatus} onChange={toggleTemplateStatus} inputProps={{ 'aria-label': 'controlled' }} />} label='is active?' />
                        </FormGroup>
                    </div>
                    <div>
                        <ButtonGroup orientation='vertical'>
                            <Button size='small' variant="outlined" onClick={createNewTemplate} >Create Template</Button>
                            <Button size='small' variant="contained" onClick={updateTemplate} >Update Template</Button>
                            <Button size='small' variant="contained" color="error" onClick={deleteTemplate}>Delete Template</Button>
                            <br />
                            <Button size='small' variant="contained" color="error" onClick={checkTemplate}>Check Template</Button>
                            <br />
                            <a className="btn btn-blue btn-small" href={baseUrl + templateId + '/reconvert/'} download>Download </a>
                            <br />
                            <Button size='small' variant="outlined" onClick={() => { setGodMode(!godMode) }}>Toggle God Mode</Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>

            <div className="ddoc-wrapper__center-col">
                {
                    godMode ?
                        !!htmlFromServer &&
                        <textarea id="main-editor"
                            value={htmlFromServer}
                            onChange={(e) => { setHtmlFromServer(e.target.value) }}
                        />
                        :
                        <div dangerouslySetInnerHTML={{
                            __html: htmlFromServer
                        }} className="ddoc-wrapper__doc-html-wrapper" id="main-text" contentEditable={true} />
                }
            </div>
            <div className="ddoc-wrapper__right-col">
                <div className="ddoc-wrapper__placeholders-wrap">
                    <div className="ddoc-wrapper__psh-container">
                        <List
                            sx={{ width: '100%', minWidth: 300, maxWidth: 300, bgcolor: 'background.paper' }}
                            aria-labelledby="nested-list-subheader"
                            subheader={
                                <ListSubheader component="div" id="nested-list-subheader">
                                    Placeholders in DB
                                </ListSubheader>
                            }
                        >
                            {renderPlaceholers(placeholderVars)}
                        </List>
                    </div>
                </div>
            </div>
            <Modal
                title="Make template active first!"
                icon="i-attantion"
                modalIsOpen={inactiveModal}
                onRequestClose={() => { setInactiveModal(false) }}
                isCloseIcon={true}
                buttons={[
                    { title: 'Close', onClick: () => { setInactiveModal(false) } }
                ]}
            />
            <Modal
                title={`Check result for docType=${templateType}`}
                modalIsOpen={checkModal}
                onRequestClose={() => { setCheckModal(false) }}
                isCloseIcon={true}
                buttons={[
                    { title: 'Close', onClick: () => { setCheckModal(false) } }
                ]}
            >
                <h2>Basic check</h2>
                <div className="modal__paragraph">
                    {
                        templateValidation?.length > 0 ?
                            templateValidation.map((txt, i) => <div className="checkmodal__item error" key={i}>{txt}</div>)
                            :
                            <div className="checkmodal__item green">OK!</div>
                    }
                </div>
                <h2>Template test</h2>
                {
                    validationData === null ?
                        <LoaderView ring />
                        :
                        <>
                            <div className="checkmodal__item error">{validationData?.message}</div>
                            {
                                validationData?.file?.link &&
                                <div className="checkmodal__item file" >
                                    <a href={validationData?.file?.link}>{validationData?.file?.filename}</a>
                                </div>
                            }
                            {
                                validationData?.file?.inviteLink &&
                                <div className="checkmodal__item invite" >
                                    <a href={validationData?.file?.inviteLink}>Invite link</a>
                                </div>
                            }

                        </>
                }
                {
                    !!validationData?.runtimeError?.exception &&
                    <div className="checkmodal__item error">{validationData?.runtimeError?.exception}: {validationData?.runtimeError?.message}</div>
                }
            </Modal>
        </div>
    )
}

export default DocumentConstructor