## Eluvio Javascript Client Utilities
### /utilities/lib/models
This directory contains validators used to check and wrap various data structures, using the [ObjectModel](http://objectmodel.js.org/) and  [Crocks](https://crocks.dev/) libraries.

They are not "Models" as described in the Model-View-Controller pattern, they encapsulate no business logic and are not meant to be instantiated. 

Using these validators does not create a model instance - depending on the function called, you will get back either a Crocks [Result](https://crocks.dev/docs/crocks/Result.html) or an ObjectModel validated value. 

Functions that return a [Result](https://crocks.dev/docs/crocks/Result.html) have names starting with `Checked` and will not throw an error if the data fails validation, instead the error will be caught and returned in the [Result](https://crocks.dev/docs/crocks/Result.html).

Functions that return an ObjectModel wrapped value will throw an error if the data fails validation. None of these functions have names starting with `Checked`. Many of the functions for more complex models have names ending in `Model`:


| Return type --> | ObjectModel wrapped value | Result |
|-------------|----------------------|---------------------|
| **Throws error on invalid data** | Yes  | No | 
| **Function name start** | Never starts with `Checked` | Always starts with `Checked`  |
|  **Function name end** | Sometimes ends with `Model`  | Never ends with `Model` | 
| **Examples** | `NonBlankString()`<br>`BlueprintModel()`<br>`OptDefModel()` | `CheckedNonBlankString()`<br>`CheckedBlueprint()`<br>`CheckedOptDef()` |
