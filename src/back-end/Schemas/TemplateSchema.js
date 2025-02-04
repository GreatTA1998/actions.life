import Joi from "joi";

export default Joi.object({
    name: Joi.string().required(),
    orderValue: Joi.number().required().default(0),
    lastGeneratedTask: Joi.string().required().allow(""),
    crontab: Joi.string().required().allow(""),
    iconURL: Joi.string().required().allow(""),
    tags: Joi.string().required().allow(""),
    timeZone: Joi.string().required(),
    notes: Joi.string().required().allow(""),
    notify: Joi.string().required().allow(""),
    duration: Joi.number().required().default(0),
    startTime: Joi.string().required().allow(""),

    // optional properties from experimental features
    isStarred: Joi.boolean().default(false),
    // id: hydrated
    // userID: hydrated
})
// use Joi.attempt(object, Schema)

