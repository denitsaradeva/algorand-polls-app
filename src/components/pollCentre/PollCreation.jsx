import React, {useState} from "react";
import {Form, Button, Row, Col} from "react-bootstrap";
import {createNewPoll} from "../../utils/pollCentre";

import { DateTimePicker} from 'react-rainbow-components';
import { ProgressSpinner } from 'primereact/progressspinner';

const PollCreation = ({address, completedCreation}) => {

    const [title, setTitle] = useState('');
    const [options, setOptions] = useState([]);

    const [date, setDate] = useState(new Date());

    const [isWaiting, setIsWaiting] = useState(false);

    const handleTitleChange = event => {
        setTitle(event.target.value);
    };

    const handleOptionsChange = (event, index) => {
        const newOptions = [...options];
        newOptions[index] = event.target.value;
        setOptions(newOptions);
    };

    const removeOption = (indexToRemove) => {
        const newOptions = options.filter((option, index) => index !== indexToRemove);
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const handleSubmit = async () => {
        let result = options.join(",");

        if(title===''){
            alert('Please add a title')
        }else if(options.length <2){
            alert('The voting options should be at least 2')
        }else{
            setIsWaiting(true);
            createNewPoll(address, title, result, date)
                .then((appId) => {
                    if(appId){
                        completedCreation(address, title, result, date, appId)
                        setIsWaiting(false);
                    }else{
                        alert('Something went wrong')
                        setIsWaiting(false);
                    }
                })
                .catch(error => {
                    console.log(error);
                    setIsWaiting(false);
            });
        }
    };

    const containerStyles = {
        maxWidth: 400,
    };

    return (
        <div>
            <Form.Control placeholder="Title" onChange={handleTitleChange} value={title}/>

            <br></br>

            <div>
                {options.map((option, index) => (
                    <div key={index}>
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <Form.Control placeholder="Option" onChange={(e) => handleOptionsChange(e, index)} value={option}/>
                            <Button variant="secondary" onClick={() => removeOption(index)} className="remove-btn btn btn-dark">
                                X
                            </Button>
                        </div>
                        <br></br>
                    </div>
                ))}
                <Button variant="secondary" type="submit" className="btn btn-dark" onClick={addOption}>
                    Add Option
                </Button>
            </div>

            <br></br>

            <div
                className="rainbow-align-content_center rainbow-m-vertical_large rainbow-p-horizontal_small rainbow-m_auto"
                style={containerStyles}
            >
                <DateTimePicker
                    value={date}
                    minDate={new Date()}
                    label="End time"
                    onChange={value => setDate(value)}
                />
            </div>

            <br></br>

            <Row className="align-items-center">
                <Col xs="auto">
                    <Button className="btn btn-dark rounded-pill btn-lg" variant="secondary" type="submit" onClick={handleSubmit}>
                        Create Poll
                    </Button>
                </Col>

                <Col xs="auto">
                    {isWaiting &&
                        <div className="flex justify-content-center">
                            <ProgressSpinner  style={{width: '50px', height: '50px'}}/>
                        </div>
                    }
                </Col>
            </Row>
        </div>
        
    );
};

export default PollCreation;