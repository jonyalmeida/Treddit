import React from "react";
import { Formik, Form } from "formik";
import { FormControl, FormLabel, Input, Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import InputField from "../components/InputField";
import {
    userRegisterMutation,
    MeQuery,
    MeDocument,
} from "../generated/graphql";

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
    const handleChange = () => {};

    return (
        <Wrapper variant='small'>
            <Formik
                onSubmit={(values) => console.log(values)}
                initialValues={{ username: "", password: "" }}>
                {({ values, handleChange }) => (
                    <Form>
                        <FormControl>
                            <FormLabel htmlFor='username'>Username</FormLabel>
                            <Input
                                value={values.username}
                                onChange={handleChange}
                                id='username'
                                placeholder='Username'
                            />
                        </FormControl>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default Register;
