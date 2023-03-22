import React, {useState} from "react";
import {Form, Button} from "react-bootstrap";
import {createNewPoll} from "../../utils/pollCentre";
import {useLocation, useNavigate} from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PollCreation = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const address = searchParams.get('address');
    console.log('Address:', address);

    const [title, setTitle] = useState('');
    const [options, setOptions] = useState([]);
    const navigate = useNavigate();

    const [date, setDate] = useState(new Date());

    console.log("DATE", date);

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

    const handleSubmit = (event) => {
        event.preventDefault();
        let result = options.join(",");
        createNewPoll(address, title, result, date)
            .catch(error => {
                console.log(error);
        });
    };

    return (
        <div>
            <Form.Control placeholder="Title" onChange={handleTitleChange} value={title}/>

            <br></br>

            <div>
                {options.map((option, index) => (
                    <div>
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

            <div>
                <DatePicker
                    selected={date}
                    onChange={setDate}
                    showTimeSelect
                    timeFormat="HH:mm:ss.SSS"
                    dateFormat="MM/dd/yyyy h:mm:ss"
                />
            </div>

            <br></br>
            
            <Button className="btn btn-dark rounded-pill btn-lg" variant="secondary" type="submit" onClick={handleSubmit}>
                Create Poll
            </Button>
        </div>
        
    );
};

export default PollCreation;