import Joi from "joi";

export default Joi.object({
    name: Joi.string().required(),
    duration: Joi.number().required(),
    orderValue: Joi.number().required(),
    parentID: Joi.string().required().allow(""),
    startTime: Joi.string().required().allow(""),
    startDateISO: Joi.string().required().allow(''),
    iconURL: Joi.string().required().allow(""),
    timeZone: Joi.string().required(),
    notify: Joi.string().required().allow(""),
    notes: Joi.string().required().allow(""),
    templateID: Joi.string().required().allow(""),
    isDone: Joi.boolean().required(),
    imageDownloadURL: Joi.string().required().allow(""),
    imageFullPath: Joi.string().required().allow(""),

    // non-required fields for prototyping
    tags: Joi.string().allow('').default(''),
    // id: hydrated
    // userID: hydrated
    isArchived: Joi.boolean().default(false),
    persistsOnList: Joi.boolean().default(true),
    listID: Joi.string().allow('').default('')
})
// useJoi.attempt(object, Schema)
