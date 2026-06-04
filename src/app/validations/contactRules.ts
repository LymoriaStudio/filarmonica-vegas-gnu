import * as yup from "yup";

export const schemaInteresse = yup.object({
    email: yup.string().email("Email Inválido").required("Campo obrigatório")
})