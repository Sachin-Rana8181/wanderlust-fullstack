const Joi = require("joi");

// Listing Schema
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),

        // Add CATEGORY validation
        category: Joi.string()
            .valid(
                "Trending",
                "Rooms",
                "Iconic Cities",
                "Mountain",
                "Castels",
                "Amazing Pools",
                "Camping",
                "Farms",
                "Arctic"
            )
            .required(),

        // FIX 1: Allow image to be either an OBJECT or a STRING ("")
        image: Joi.alternatives().try(
            Joi.object({
                url: Joi.string().allow("", null),
                filename: Joi.string().allow("", null)
            }),
            Joi.string().allow("", null)
        ).optional()

    }).required()
});

// Review Schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        Comment: Joi.string().required()
    }).required()
});
