import {
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Textarea,
    useToast,
} from '@chakra-ui/react'
import { Field, Form, Formik } from 'formik'

export type ListFormValues = {
    name: string
    description: string
}

export type ListFormProps = {
    onSubmit: (values: ListFormValues, onSuccess: () => void) => void
}

export default function ListForm(props: ListFormProps) {
    const { onSubmit } = props

    const toast = useToast()
    return (
        <Formik
            initialValues={{ name: '', description: '' }}
            validate={(values) => {
                const errors: {
                    name?: string
                    description?: string
                } = {}

                if (!values.name) {
                    errors.name = 'Name is required'
                }
                if (!values.description) {
                    errors.description = 'Description is required'
                }

                return errors
            }}
            onSubmit={(values, { setSubmitting, resetForm }) => {
                onSubmit(values, () => {
                    toast({
                        title: 'List created.',
                        description: 'Your List was created successfully.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    })
                    resetForm()
                    setSubmitting(false)
                })
            }}
        >
            {({ errors, isSubmitting, touched }) => (
                <Form>
                    <FormControl isInvalid={touched.name && !!errors.name}>
                        <FormLabel htmlFor="name">Name</FormLabel>
                        <Field as={Input} id="name" name="name" />
                        <FormHelperText color="red">
                            {(touched.name && errors.name) ?? ''}
                        </FormHelperText>
                    </FormControl>
                    <FormControl
                        isInvalid={touched.description && !!errors.description}
                    >
                        <FormLabel htmlFor="description">Description</FormLabel>
                        <Field
                            as={Textarea}
                            id="description"
                            name="description"
                        />
                        <FormHelperText color="red">
                            {(touched.description && errors.description) ?? ''}
                        </FormHelperText>
                    </FormControl>
                    <Button
                        mt={4}
                        colorScheme="blue"
                        type="submit"
                        isLoading={isSubmitting}
                    >
                        Create List
                    </Button>
                </Form>
            )}
        </Formik>
    )
}
