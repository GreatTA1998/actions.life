import Joi from "joi"

export default Joi.object({
    FCMTokens: Joi.array().items(Joi.string()).required().default([]),
    email: Joi.string().required().allow(""),
    isSubscriber: Joi.boolean().required().default(false),
    phoneNumber: Joi.string().allow(""),
    maxOrderValue: Joi.number().required().default(0),
    uid: Joi.string().required(),
})