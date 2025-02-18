const { celebrate, Joi, Segments } = require('celebrate')

const celebrateMiddleware = celebrateSchema => {
  if (celebrateSchema === 'createCampaign') {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        title: Joi.string().required().messages({
          'string.base': 'CAMPAIGN_TITLE_WRONG_TYPE',
          'string.empty': 'CAMPAIGN_TITLE_REQUIRED',
          'any.required': 'CAMPAIGN_TITLE_REQUIRED'
        }),
        chain_id: Joi.string().required().messages({
          'string.base': 'CHAIN_ID_WRONG_TYPE',
          'string.empty': 'CHAIN_ID_REQUIRED',
          'any.required': 'CHAIN_ID_REQUIRED'
        }),
        campaign_number: Joi.number().required().messages({
          'number.base': 'CAMPAIGN_NUMBER_WRONG_TYPE',
          'number.empty': 'CAMPAIGN_NUMBER_REQUIRED',
          'any.required': 'CAMPAIGN_NUMBER_REQUIRED'
        }),
        token_address: Joi.string().required().messages({
          'string.base': 'TOKEN_ADDRESS_WRONG_TYPE',
          'string.empty': 'TOKEN_ADDRESS_REQUIRED',
          'any.required': 'TOKEN_ADDRESS_REQUIRED'
        }),
        sdk: Joi.boolean().required().messages({
          'boolean.base': 'SDK_WRONG_TYPE',
          'any.required': 'SDK_REQUIRED'
        }),
        symbol: Joi.string().required().messages({
          'string.base': 'SYMBOL_WRONG_TYPE',
          'string.empty': 'SYMBOL_REQUIRED',
          'any.required': 'SYMBOL_REQUIRED'
        }),
        wallet: Joi.string().required().messages({
          'string.base': 'WALLET_WRONG_TYPE',
          'string.empty': 'WALLET_REQUIRED',
          'any.required': 'WALLET_REQUIRED'
        }),
        proxy_contract_address: Joi.string().required().messages({
          'string.base': 'PROXY_CONTRACT_ADDRESS_WRONG_TYPE',
          'string.empty': 'PROXY_CONTRACT_ADDRESS_REQUIRED',
          'any.required': 'PROXY_CONTRACT_ADDRESS_REQUIRED'
        }),
        encrypted_signer_key: Joi.string().required().messages({
          'string.base': 'ENCRYPTED_SIGNER_KEY_WRONG_TYPE',
          'string.empty': 'ENCRYPTED_SIGNER_KEY_REQUIRED',
          'any.required': 'ENCRYPTED_SIGNER_KEY_REQUIRED'
        }),
        signer_address: Joi.string().required().messages({
          'string.base': 'SIGNER_ADDRESS_WRONG_TYPE',
          'string.empty': 'SIGNER_ADDRESS_REQUIRED',
          'any.required': 'SIGNER_ADDRESS_REQUIRED'
        }),
        token_standard: Joi.string().valid('ERC20', 'ERC721', 'ERC1155').required().messages({
          'string.base': 'TOKEN_STANDARD_WRONG_TYPE',
          'string.empty': 'TOKEN_STANDARD_REQUIRED',
          'any.required': 'TOKEN_STANDARD_REQUIRED',
          'any.only': 'TOKEN_STANDARD_NOT_VALID'
        }),
        creator_address: Joi.string().required().messages({
          'string.base': 'CREATOR_ADDRESS_WRONG_TYPE',
          'string.empty': 'CREATOR_ADDRESS_REQUIRED',
          'any.required': 'CREATOR_ADDRESS_REQUIRED'
        }),
        claim_pattern: Joi.string().valid('mint', 'transfer').required().messages({
          'string.base': 'CLAIM_PATTERN_WRONG_TYPE',
          'string.empty': 'CLAIM_PATTERN_REQUIRED',
          'any.required': 'CLAIM_PATTERN_REQUIRED',
          'any.only': 'CLAIM_PATTERN_NOT_VALID'
        }),
        proxy_contract_version: Joi.string().required().messages({
          'string.base': 'PROXY_CONTRACT_VERSION_WRONG_TYPE',
          'string.empty': 'PROXY_CONTRACT_VERSION_REQUIRED',
          'any.required': 'PROXY_CONTRACT_VERSION_REQUIRED'
        }),
        sponsored: Joi.boolean().required().messages({
          'boolean.base': 'SPONSORED_WRONG_TYPE',
          'any.required': 'SPONSORED_REQUIRED'
        }),
        claiming_finished_button_url: Joi.string().optional().messages({
          'string.base': 'CLAIMING_FINISHED_BUTTON_URL_WRONG_TYPE',
          'string.empty': 'CLAIMING_FINISHED_BUTTON_URL_EMPTY'
        }),
        claiming_finished_description: Joi.string().optional().messages({
          'string.base': 'CLAIMING_FINISHED_DESCRIPTION_WRONG_TYPE',
          'string.empty': 'CLAIMING_FINISHED_DESCRIPTION_EMPTY'
        }),
        claiming_finished_button_title: Joi.string().optional().messages({
          'string.base': 'CLAIMING_FINISHED_BUTTON_TITLE_WRONG_TYPE',
          'string.empty': 'CLAIMING_FINISHED_BUTTON_TITLE_EMPTY'
        }),
        available_countries: Joi.array().items(Joi.string()).optional().messages({
          'array.base': 'AVAILABLE_COUNTRIES_WRONG_TYPE',
          'array.includes': 'AVAILABLE_COUNTRIES_INVALID_ITEMS'
        }),
        claim_links: Joi.array().items(Joi.object()).min(1).optional().messages({
          'array.base': 'CLAIM_LINKS_WRONG_TYPE',
          'array.includes': 'CLAIM_LINKS_INVALID_ITEMS',
          'array.min': 'CLAIM_LINKS_EMPTY'
        }),
        batch_description: Joi.string().optional().messages({
          'string.base': 'BATCH_DESCRIPTION_WRONG_TYPE',
          'string.empty': 'BATCH_DESCRIPTION_EMPTY',
          'any.required': 'BATCH_DESCRIPTION_REQUIRED'
        }),
        preferred_wallet_on: Joi.boolean().optional().messages({
          'boolean.base': 'PREFERRED_WALLET_ON_WRONG_TYPE',
          'any.required': 'PREFERRED_WALLET_ON_REQUIRED'
        }),
        additional_wallets_on: Joi.boolean().optional().messages({
          'boolean.base': 'ADDITIONAL_WALLETS_ON_WRONG_TYPE',
          'any.required': 'ADDITIONAL_WALLETS_ON_REQUIRED'
        }),
        available_countries_on: Joi.boolean().optional().messages({
          'boolean.base': 'AVAILABLE_COUNTRIES_ON_WRONG_TYPE',
          'any.required': 'AVAILABLE_COUNTRIES_ON_REQUIRED'
        }),
        claiming_finished_button_on: Joi.boolean().optional().messages({
          'boolean.base': 'CLAIMING_FINISHED_BUTTON_ON_WRONG_TYPE',
          'any.required': 'CLAIMING_FINISHED_BUTTON_ON_REQUIRED'
        }),
        collection_id: Joi.string().optional().messages({
          'string.base': 'COLLECTION_ID_WRONG_TYPE',
          'string.empty': 'COLLECTION_ID_EMPTY',
          'any.required': 'COLLECTION_ID_REQUIRED'
        }),
        collection_token_id: Joi.string().optional().messages({
          'string.base': 'COLLECTION_TOKEN_ID_WRONG_TYPE',
          'string.empty': 'COLLECTION_TOKEN_ID_EMPTY',
          'any.required': 'COLLECTION_TOKEN_ID_REQUIRED'
        }),
        multiple_claims_on: Joi.boolean().optional().messages({
          'boolean.base': 'MULTIPLY_CLAIMS_ON_WRONG_TYPE',
          'any.required': 'MULTIPLY_CLAIMS_ON_REQUIRED'
        }),
        claim_host_on: Joi.boolean().optional().messages({
          'boolean.base': 'CLAIM_HOST_ON_WRONG_TYPE',
          'any.required': 'CLAIM_HOST_ON_REQUIRED'
        }),
        claim_host: Joi.string().allow('').optional().messages({
          'string.base': 'CLAIM_HOST_WRONG_TYPE'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'getUserCampaigns') {
    return celebrate({
      [Segments.QUERY]: Joi.object().keys({
        chain_id: Joi.string().required().messages({
          'string.base': 'CHAIN_ID_WRONG_TYPE',
          'string.empty': 'CHAIN_ID_REQUIRED',
          'any.required': 'CHAIN_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'checkCampaignId') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        campaign_id: Joi.string().required().messages({
          'string.base': 'CAMPAIGN_ID_WRONG_TYPE',
          'string.empty': 'CAMPAIGN_ID_REQUIRED',
          'any.required': 'CAMPAIGN_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'updateCampaign') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        campaign_id: Joi.string().required().messages({
          'string.base': 'CAMPAIGN_ID_WRONG_TYPE',
          'string.empty': 'CAMPAIGN_ID_REQUIRED',
          'any.required': 'CAMPAIGN_ID_REQUIRED'
        })
      }),
      [Segments.BODY]: Joi.object().keys({
        title: Joi.string().optional().messages({
          'string.base': 'TITLE_WRONG_TYPE',
          'string.empty': 'TITLE_EMPTY',
          'any.required': 'TITLE_REQUIRED'
        }),
        wallet: Joi.string().optional().messages({
          'string.base': 'WALLET_WRONG_TYPE',
          'string.empty': 'WALLET_EMPTY',
          'any.required': 'WALLET_REQUIRED'
        }),
        available_countries: Joi.array().items(Joi.string()).optional().messages({
          'array.base': 'AVAILABLE_COUNTRIES_WRONG_TYPE',
          'array.includes': 'AVAILABLE_COUNTRIES_INVALID_ITEMS',
          'any.required': 'AVAILABLE_COUNTRIES_REQUIRED'
        }),
        claiming_finished_button_url: Joi.string().optional().messages({
          'string.base': 'CLAIMING_FINISHED_BUTTON_URL_WRONG_TYPE',
          'string.empty': 'CLAIMING_FINISHED_BUTTON_URL_EMPTY',
          'any.required': 'CLAIMING_FINISHED_BUTTON_URL_REQUIRED'
        }),
        claiming_finished_button_title: Joi.string().optional().allow('').messages({
          'string.base': 'CLAIMING_FINISHED_BUTTON_TITLE_WRONG_TYPE',
          'any.required': 'CLAIMING_FINISHED_BUTTON_TITLE_REQUIRED'
        }),
        claiming_finished_description: Joi.string().optional().messages({
          'string.base': 'CLAIMING_FINISHED_DESCRIPTION_WRONG_TYPE',
          'string.empty': 'CLAIMING_FINISHED_DESCRIPTION_EMPTY',
          'any.required': 'CLAIMING_FINISHED_DESCRIPTION_REQUIRED'
        }),
        available_countries_on: Joi.boolean().optional().messages({
          'boolean.base': 'AVAILABLE_COUNTRIES_ON_WRONG_TYPE',
          'any.required': 'AVAILABLE_COUNTRIES_ON_REQUIRED'
        }),
        preferred_wallet_on: Joi.boolean().optional().messages({
          'boolean.base': 'PREFERRED_WALLET_ON_WRONG_TYPE',
          'any.required': 'PREFERRED_WALLET_ON_REQUIRED'
        }),
        claiming_finished_button_on: Joi.boolean().optional().messages({
          'boolean.base': 'CLAIMING_FINISHED_BUTTON_ON_WRONG_TYPE',
          'any.required': 'CLAIMING_FINISHED_BUTTON_ON_REQUIRED'
        }),
        claim_host: Joi.string().allow('').optional().messages({
          'string.base': 'CLAIM_HOST_WRONG_TYPE'
        }),
        claim_host_on: Joi.boolean().optional().messages({
          'boolean.base': 'CLAIM_HOST_ON_WRONG_TYPE',
          'any.required': 'CLAIM_HOST_ON_REQUIRED'
        }),
        multiple_claims_on: Joi.boolean().optional().messages({
          'boolean.base': 'MULTIPLE_CLAIMS_ON_WRONG_TYPE',
          'any.required': 'MULTIPLE_CLAIMS_ON_REQUIRED'
        }),
        additional_wallets_on: Joi.boolean().optional().messages({
          'boolean.base': 'ADDITIONAL_WALLETS_ON_WRONG_TYPE',
          'any.required': 'ADDITIONAL_WALLETS_ON_REQUIRED'
        }),
        archived: Joi.boolean().optional().messages({
          'boolean.base': 'ARCHIVED_WRONG_TYPE',
          'any.required': 'ARCHIVED_REQUIRED'
        }),
        claiming_finished_auto_redirect: Joi.boolean().optional().messages({
          'boolean.base': 'CLAIMING_FINISHED_AUTO_REDIRECT_WRONG_TYPE',
          'any.required': 'CLAIMING_FINISHED_AUTO_REDIRECT_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'getLinksBatchById') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        campaign_id: Joi.string().required().messages({
          'string.base': 'CAMPAIGN_ID_WRONG_TYPE',
          'string.empty': 'CAMPAIGN_ID_REQUIRED',
          'any.required': 'CAMPAIGN_ID_REQUIRED'
        }),
        batch_id: Joi.string().required().messages({
          'string.base': 'BATCH_ID_WRONG_TYPE',
          'string.empty': 'BATCH_ID_REQUIRED',
          'any.required': 'BATCH_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'claim') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        link_id: Joi.string().required().messages({
          'string.base': 'LINK_ID_WRONG_TYPE',
          'string.empty': 'LINK_ID_REQUIRED',
          'any.required': 'LINK_ID_REQUIRED'
        })
      }),
      [Segments.BODY]: Joi.object().keys({
        receiver_address: Joi.string().required().messages({
          'string.base': 'RECEIVER_ADDRESS_WRONG_TYPE',
          'string.empty': 'RECEIVER_ADDRESS_REQUIRED',
          'any.required': 'RECEIVER_ADDRESS_REQUIRED'
        }),
        receiver_signature: Joi.string().required().messages({
          'string.base': 'RECEIVER_SIGNATURE_WRONG_TYPE',
          'string.empty': 'RECEIVER_SIGNATURE_REQUIRED',
          'any.required': 'RECEIVER_SIGNATURE_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'checkLinkId') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        link_id: Joi.string().required().messages({
          'string.base': 'LINK_ID_WRONG_TYPE',
          'string.empty': 'LINK_ID_REQUIRED',
          'any.required': 'LINK_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'addEncryptedKey') {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        encrypted_key: Joi.string().required().messages({
          'string.base': 'ENCRYPTED_KEY_WRONG_TYPE',
          'string.empty': 'ENCRYPTED_KEY_REQUIRED',
          'any.required': 'ENCRYPTED_KEY_REQUIRED'
        }),
        key_id: Joi.string().required().messages({
          'string.base': 'KEY_ID_WRONG_TYPE',
          'string.empty': 'KEY_ID_REQUIRED',
          'any.required': 'KEY_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'login') {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        msg: Joi.string().required().messages({
          'string.base': 'MSG_WRONG_TYPE',
          'string.empty': 'MSG_REQUIRED',
          'any.required': 'MSG_REQUIRED'
        }),
        sig: Joi.string().required().messages({
          'string.base': 'SIG_WRONG_TYPE',
          'string.empty': 'SIG_REQUIRED',
          'any.required': 'SIG_REQUIRED'
        }),
        timestamp: Joi.number().required().messages({
          'number.base': 'TIMESTAMP_WRONG_TYPE',
          'number.empty': 'TIMESTAMP_REQUIRED',
          'any.required': 'TIMESTAMP_REQUIRED'
        }),
        user_address: Joi.string().required().messages({
          'string.base': 'USER_ADDRESS_WRONG_TYPE',
          'string.empty': 'USER_ADDRESS_REQUIRED',
          'any.required': 'USER_ADDRESS_REQUIRED'
        }),
        chain_id: Joi.number().required().messages({
          'number.base': 'CHAIN_ID_WRONG_TYPE',
          'number.empty': 'CHAIN_ID_REQUIRED',
          'any.required': 'CHAIN_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'getNonce') {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        user_address: Joi.string().required().messages({
          'string.base': 'USER_ADDRESS_WRONG_TYPE',
          'string.empty': 'USER_ADDRESS_REQUIRED',
          'any.required': 'USER_ADDRESS_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'createDispenser') {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        title: Joi.string().required().messages({
          'string.base': 'TITLE_WRONG_TYPE',
          'string.empty': 'TITLE_REQUIRED',
          'any.required': 'TITLE_REQUIRED'
        }),
        multiscan_qr_id: Joi.string().required().messages({
          'string.base': 'MULTISCAN_QR_ID_WRONG_TYPE',
          'string.empty': 'MULTISCAN_QR_ID_REQUIRED',
          'any.required': 'MULTISCAN_QR_ID_REQUIRED'
        }),
        claim_start: Joi.number().min(1).integer().optional().messages({
          'number.base': 'CLAIM_START_WRONG_TYPE',
          'number.integer': 'CLAIM_START_WRONG_TYPE',
          'number.empty': 'CLAIM_START_REQUIRED',
          'number.min': 'CLAIM_START_WRONG_VALUE',
          'any.required': 'CLAIM_START_REQUIRED'
        }),
        claim_finish: Joi.number().min(1).integer().optional().messages({
          'number.base': 'CLAIM_FINISH_WRONG_TYPE',
          'number.integer': 'CLAIM_FINISH_WRONG_TYPE',
          'number.empty': 'CLAIM_FINISH_REQUIRED',
          'number.min': 'CLAIM_FINISH_WRONG_VALUE',
          'any.required': 'CLAIM_FINISH_REQUIRED'
        }),
        claim_duration: Joi.number().min(1).integer().optional().messages({
          'number.base': 'CLAIM_DURATION_WRONG_TYPE',
          'number.integer': 'CLAIM_DURATION_WRONG_TYPE',
          'number.empty': 'CLAIM_DURATION_REQUIRED',
          'number.min': 'CLAIM_DURATION_WRONG_VALUE',
          'any.required': 'CLAIM_DURATION_REQUIRED'
        }),
        encrypted_multiscan_qr_secret: Joi.string().required().messages({
          'string.base': 'ENCRYPTED_MULTISCAN_QR_SECRET_WRONG_TYPE',
          'string.empty': 'ENCRYPTED_MULTISCAN_QR_SECRET_REQUIRED',
          'any.required': 'ENCRYPTED_MULTISCAN_QR_SECRET_REQUIRED'
        }),
        encrypted_multiscan_qr_enc_code: Joi.string().required().messages({
          'string.base': 'ENCRYPTED_MULTISCAN_QR_ENC_CODE_WRONG_TYPE',
          'string.empty': 'ENCRYPTED_MULTISCAN_QR_ENC_CODE_REQUIRED',
          'any.required': 'ENCRYPTED_MULTISCAN_QR_ENC_CODE_REQUIRED'
        }),
        redirect_url: Joi.string().optional().messages({
          'string.base': 'REDIRECT_URL_WRONG_TYPE',
          'string.empty': 'REDIRECT_URL_REQUIRED'
        }),
        redirect_on: Joi.boolean().optional().messages({
          'boolean.base': 'REDIRECT_ON_WRONG_TYPE'
        }),
        dynamic: Joi.boolean().optional().messages({
          'boolean.base': 'DYNAMIC_WRONG_TYPE',
          'boolean.empty': 'DYNAMIC_REQUIRED',
          'any.required': 'DYNAMIC_REQUIRED'
        }),
        reclaim: Joi.boolean().optional().messages({
          'boolean.base': 'RECLAIM_WRONG_TYPE',
          'boolean.empty': 'RECLAIM_REQUIRED',
          'any.required': 'RECLAIM_REQUIRED'
        }),
        timeframe_on: Joi.boolean().optional().messages({
          'boolean.base': 'TIMEFRAME_ON_WRONG_TYPE',
          'boolean.empty': 'TIMEFRAME_ON_REQUIRED',
          'any.required': 'TIMEFRAME_ON_REQUIRED'
        }),
        app_title: Joi.string().optional().messages({
          'string.base': 'APP_TITLE_WRONG_TYPE',
          'string.empty': 'APP_TITLE_REQUIRED'
        }),
        app_title_on: Joi.boolean().optional().messages({
          'boolean.base': 'APP_TITLE_ON_WRONG_TYPE'
        }),
        reclaim_app_id: Joi.string().optional().allow('').messages({
          'string.base': 'RECLAIM_APP_ID_WRONG_TYPE'
        }),
        reclaim_app_secret: Joi.string().optional().allow('').messages({
          'string.base': 'RECLAIM_APP_SECRET_WRONG_TYPE'
        }),
        reclaim_provider_id: Joi.string().optional().allow('').messages({
          'string.base': 'RECLAIM_PROVIDER_ID_WRONG_TYPE'
        }),
        instagram_follow_id: Joi.string().optional().allow("").messages({
          'string.base': 'INSTAGRAM_FOLLOW_ID_WRONG_TYPE'
        }),
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'updateDispenser') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        dispenser_id: Joi.string().required().messages({
          'string.base': 'DISPENSER_ID_WRONG_TYPE',
          'string.empty': 'DISPENSER_ID_REQUIRED',
          'any.required': 'DISPENSER_ID_REQUIRED'
        })
      }),
      [Segments.BODY]: Joi.object().keys({
        claim_start: Joi.number().min(1).integer().allow(null).optional().messages({
          'number.base': 'CLAIM_START_WRONG_TYPE',
          'number.integer': 'CLAIM_START_WRONG_TYPE',
          'number.empty': 'CLAIM_START_REQUIRED',
          'number.min': 'CLAIM_START_WRONG_VALUE',
          'any.required': 'CLAIM_START_REQUIRED'
        }),
        claim_finish: Joi.number().min(1).integer().allow(null).optional().messages({
          'number.base': 'CLAIM_FINISH_WRONG_TYPE',
          'number.integer': 'CLAIM_FINISH_WRONG_TYPE',
          'number.empty': 'CLAIM_FINISH_REQUIRED',
          'number.min': 'CLAIM_FINISH_WRONG_VALUE',
          'any.required': 'CLAIM_FINISH_REQUIRED'
        }),
        claim_duration: Joi.number().min(1).integer().optional().messages({
          'number.base': 'CLAIM_DURATION_WRONG_TYPE',
          'number.integer': 'CLAIM_DURATION_WRONG_TYPE',
          'number.empty': 'CLAIM_DURATION_REQUIRED',
          'number.min': 'CLAIM_DURATION_WRONG_VALUE',
          'any.required': 'CLAIM_DURATION_REQUIRED'
        }),
        app_title: Joi.string().optional().messages({
          'string.base': 'APP_TITLE_WRONG_TYPE',
          'string.empty': 'APP_TITLE_REQUIRED'
        }),
        app_title_on: Joi.boolean().optional().messages({
          'boolean.base': 'APP_TITLE_ON_WRONG_TYPE'
        }),
        archived: Joi.boolean().optional().messages({
          'boolean.base': 'ARCHIVED_WRONG_TYPE',
          'any.required': 'ARCHIVED_REQUIRED'
        }),
        active: Joi.boolean().optional().messages({
          'boolean.base': 'ACTIVE_WRONG_TYPE',
          'boolean.empty': 'ACTIVE_REQUIRED'
        }),
        redirect_url: Joi.string().optional().messages({
          'string.base': 'REDIRECT_URL_WRONG_TYPE',
          'string.empty': 'REDIRECT_URL_REQUIRED'
        }),
        redirect_on: Joi.boolean().optional().messages({
          'boolean.base': 'REDIRECT_ON_WRONG_TYPE',
          'boolean.empty': 'REDIRECT_ON_REQUIRED'
        }),
        timeframe_on: Joi.boolean().optional().messages({
          'boolean.base': 'TIMEFRAME_ON_WRONG_TYPE',
          'boolean.empty': 'TIMEFRAME_ON_REQUIRED'
        }),
        whitelist_on: Joi.boolean().optional().messages({
          'boolean.base': 'WHITELIST_ON_WRONG_TYPE',
          'boolean.empty': 'WHITELIST_ON_REQUIRED'
        }),
        instagram_follow_id: Joi.string().optional().messages({
          'string.base': 'INSTAGRAM_FOLLOW_ID_WRONG_TYPE',
          'string.empty': 'INSTAGRAM_FOLLOW_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'uploadLinks') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        dispenser_id: Joi.string().required().messages({
          'string.base': 'DISPENSER_ID_WRONG_TYPE',
          'string.empty': 'DISPENSER_ID_REQUIRED',
          'any.required': 'DISPENSER_ID_REQUIRED'
        })
      }),
      [Segments.BODY]: Joi.object().keys({
        preview_setting: Joi.string().valid('stub', 'token', 'custom').required().messages({
          'string.base': 'PREVIEW_SETTING_WRONG_TYPE',
          'string.empty': 'PREVIEW_SETTING_IS_EMPTY',
          'any.required': 'PREVIEW_SETTING_REQUIRED',
          'any.only': 'PREVIEW_SETTING_INVALID'
        }),
        encrypted_claim_links: Joi.array().items(
          Joi.object().keys({
            link_id: Joi.string().required().messages({
              'string.base': 'LINK_ID_WRONG_TYPE',
              'string.empty': 'LINK_ID_REQUIRED',
              'any.required': 'LINK_ID_REQUIRED'
            }),
            encrypted_claim_link: Joi.string().required().messages({
              'string.base': 'ENCRYPTED_CLAIM_LINK_WRONG_TYPE',
              'string.empty': 'ENCRYPTED_CLAIM_LINK_REQUIRED',
              'any.required': 'ENCRYPTED_CLAIM_LINK_REQUIRED'
            })
          })
        ).min(1).required().messages({
          'array.base': 'ENCRYPTED_CLAIM_LINKS_ARRAY_WRONG_TYPE',
          'array.min': 'ENCRYPTED_CLAIM_LINKS_ARRAY_IS_EMPTY',
          'any.required': 'ENCRYPTED_CLAIM_LINKS_ARRAY_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'updateLinks') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        dispenser_id: Joi.string().required().messages({
          'string.base': 'DISPENSER_ID_WRONG_TYPE',
          'string.empty': 'DISPENSER_ID_REQUIRED',
          'any.required': 'DISPENSER_ID_REQUIRED'
        })
      }),
      [Segments.BODY]: Joi.object().keys({
        preview_setting: Joi.string().valid('stub', 'token', 'custom').required().messages({
          'string.base': 'PREVIEW_SETTING_WRONG_TYPE',
          'string.empty': 'PREVIEW_SETTING_IS_EMPTY',
          'any.required': 'PREVIEW_SETTING_REQUIRED',
          'any.only': 'PREVIEW_SETTING_INVALID'
        }),
        encrypted_claim_links: Joi.array().items(
          Joi.object().keys({
            link_id: Joi.string().required().messages({
              'string.base': 'LINK_ID_WRONG_TYPE',
              'string.empty': 'LINK_ID_REQUIRED',
              'any.required': 'LINK_ID_REQUIRED'
            }),
            encrypted_claim_link: Joi.string().required().messages({
              'string.base': 'ENCRYPTED_CLAIM_LINK_WRONG_TYPE',
              'string.empty': 'ENCRYPTED_CLAIM_LINK_REQUIRED',
              'any.required': 'ENCRYPTED_CLAIM_LINK_REQUIRED'
            })
          })
        ).min(1).required().messages({
          'array.base': 'ENCRYPTED_CLAIM_LINKS_ARRAY_WRONG_TYPE',
          'array.min': 'ENCRYPTED_CLAIM_LINKS_ARRAY_IS_EMPTY',
          'any.required': 'ENCRYPTED_CLAIM_LINKS_ARRAY_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'popReclaimLink') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        multiscan_qr_id: Joi.string().required().messages({
          'string.base': 'MULTISCAN_QR_ID_WRONG_TYPE',
          'string.empty': 'MULTISCAN_QR_ID_REQUIRED',
          'any.required': 'MULTISCAN_QR_ID_REQUIRED'
        })
      }),
      [Segments.BODY]: Joi.object().keys({
        reclaim_session_id: Joi.string().required().messages({
          'string.base': 'RECLAIM_SESSION_ID_WRONG_TYPE',
          'string.empty': 'RECLAIM_SESSION_ID_REQUIRED',
          'any.required': 'RECLAIM_SESSION_ID_REQUIRED'
        })
      }),
      [Segments.QUERY]: Joi.object().keys({
        socket_id: Joi.string().optional().messages({
          'string.base': 'SOCKET_ID_WRONG_TYPE',
          'string.empty': 'SOCKET_ID_REQUIRED',
          'any.required': 'SOCKET_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'getLinksReport') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        dispenser_id: Joi.string().required().messages({
          'string.base': 'DISPENSER_ID_WRONG_TYPE',
          'string.empty': 'DISPENSER_ID_REQUIRED',
          'any.required': 'DISPENSER_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'getPaymentStatus') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        transfer_id: Joi.string().required().messages({
          'string.base': 'TRANSFER_ID_WRONG_TYPE',
          'string.empty': 'TRANSFER_ID_REQUIRED',
          'any.required': 'TRANSFER_ID_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'redeem') {
    return celebrate({
      [Segments.BODY]: Joi.object().keys({
        receiver: Joi.string().required().messages({
          'string.base': 'RECEIVER_WRONG_TYPE',
          'string.empty': 'RECEIVER_REQUIRED',
          'any.required': 'RECEIVER_REQUIRED'
        }),
        transfer_id: Joi.string().required().messages({
          'string.base': 'TRANSFER_ID_WRONG_TYPE',
          'string.empty': 'TRANSFER_ID_REQUIRED',
          'any.required': 'TRANSFER_ID_REQUIRED'
        }),
        receiver_sig: Joi.string().required().messages({
          'string.base': 'RECEIVER_SIG_WRONG_TYPE',
          'string.empty': 'RECEIVER_SIG_REQUIRED',
          'any.required': 'RECEIVER_SIG_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }

  if (celebrateSchema === 'claim') {
    return celebrate({
      [Segments.PARAMS]: Joi.object().keys({
        link_id: Joi.string().required().messages({
          'string.base': 'LINK_ID_WRONG_TYPE',
          'string.empty': 'LINK_ID_REQUIRED',
          'any.required': 'LINK_ID_REQUIRED'
        })
      }),
      [Segments.BODY]: Joi.object().keys({
        receiver_address: Joi.string().required().messages({
          'string.base': 'RECEIVER_ADDRESS_WRONG_TYPE',
          'string.empty': 'RECEIVER_ADDRESS_REQUIRED',
          'any.required': 'RECEIVER_ADDRESS_REQUIRED'
        }),
        receiver_signature: Joi.string().required().messages({
          'string.base': 'RECEIVER_SIGNATURE_WRONG_TYPE',
          'string.empty': 'RECEIVER_SIGNATURE_REQUIRED',
          'any.required': 'RECEIVER_SIGNATURE_REQUIRED'
        })
      })
    }, { abortEarly: false, mode: 'FULL' })
  }
}

module.exports = {
  celebrateMiddleware
}
