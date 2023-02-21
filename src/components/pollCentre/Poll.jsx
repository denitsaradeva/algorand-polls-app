import React, {useState} from "react";
import PropTypes from "prop-types";
import {Badge, Button, Card, Col, Stack} from "react-bootstrap";

const Poll = ({address, creator, title, options, voted}) => {
    return (
        <Col>
            <Card className="h-100">
                <Card.Header>
                    <Card.Title>{title}</Card.Title>
                    <Stack direction="horizontal" gap={2}>
                        <span className="font-monospace text-secondary">{creator}</span>
                    </Stack>
                </Card.Header>
                <Card.Body className="d-flex flex-column text-center">
                        <Card.Text>{options}</Card.Text>
                        {/* <Button
                            variant="outline-dark"
                            onClick={() => castVote(poll, choice)}
                            className="w-75 py-3"
                        >
                            Vote
                        </Button> */}
                </Card.Body>
                <Card.Footer>{voted} voted.</Card.Footer>
            </Card>
        </Col>
    );
};

Poll.propTypes = {
    address: PropTypes.string.isRequired,
    poll: PropTypes.instanceOf(Object).isRequired
};

export default Poll;