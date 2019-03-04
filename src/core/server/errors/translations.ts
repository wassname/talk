import { ERROR_CODES } from "talk-common/errors";

export const ERROR_TRANSLATIONS: Record<ERROR_CODES, string> = {
  COMMENT_BODY_TOO_SHORT: "error-commentBodyTooShort",
  COMMENT_BODY_EXCEEDS_MAX_LENGTH: "error-commentBodyExceedsMaxLength",
  STORY_URL_NOT_PERMITTED: "error-storyURLNotPermitted",
  TOKEN_NOT_FOUND: "error-tokenNotFound",
  DUPLICATE_STORY_URL: "error-duplicateStoryURL",
  EMAIL_ALREADY_SET: "error-emailAlreadySet",
  EMAIL_NOT_SET: "error-emailNotSet",
  TENANT_NOT_FOUND: "error-tenantNotFound",
  DUPLICATE_USER: "error-duplicateUser",
  DUPLICATE_USERNAME: "error-duplicateUsername",
  DUPLICATE_EMAIL: "error-duplicateEmail",
  LOCAL_PROFILE_ALREADY_SET: "error-localProfileAlreadySet",
  LOCAL_PROFILE_NOT_SET: "error-localProfileNotSet",
  USERNAME_ALREADY_SET: "error-usernameAlreadySet",
  USERNAME_CONTAINS_INVALID_CHARACTERS:
    "error-usernameContainsInvalidCharacters",
  USERNAME_EXCEEDS_MAX_LENGTH: "error-usernameExceedsMaxLength",
  USERNAME_TOO_SHORT: "error-usernameTooShort",
  PASSWORD_TOO_SHORT: "error-passwordTooShort",
  DISPLAY_NAME_EXCEEDS_MAX_LENGTH: "error-displayNameExceedsMaxLength",
  EMAIL_INVALID_FORMAT: "error-emailInvalidFormat",
  EMAIL_EXCEEDS_MAX_LENGTH: "error-emailExceedsMaxLength",
  USER_NOT_FOUND: "error-userNotFound",
  NOT_FOUND: "error-notFound",
  INTERNAL_ERROR: "error-internalError",
  TOKEN_INVALID: "error-tokenInvalid",
  TENANT_INSTALLED_ALREADY: "error-tenantInstalledAlready",
  USER_NOT_ENTITLED: "error-userNotEntitled",
};