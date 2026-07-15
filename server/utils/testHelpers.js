/**
 * utils/testHelpers.js  (Part 4 Prompt 01 + Part 5 Prompt 01)
 *
 * Shared helper functions for test/section logic.
 * Keeping this logic centralised prevents drift between routes that
 * all need to know "what section comes next?".
 */

/**
 * getOrCreateSiblingTest(Test, categoryId, testNumber, session)
 *
 * Returns the Test document for a specific category + testNumber,
 * creating it if it doesn't exist yet.
 *
 * Why this exists: the military-category sharing logic (verbal/non-verbal
 * save endpoints in routes/adminTests.js) needs to attach a shared section
 * to the SAME numbered test in each of the 3 default categories — e.g.
 * Army Test 2's verbal section must sync to Navy Test 2 and Air Force
 * Test 2 specifically, not to "whichever test happens to still be
 * unpublished" in those categories. Matching by isPublished:false alone
 * breaks as soon as a sibling category's earlier test (e.g. Test 1) is
 * still incomplete (academic section not yet filled in) when a later
 * test is started elsewhere — it would silently overwrite the earlier
 * test instead of creating the new one. Matching by testNumber avoids
 * that regardless of what order/pace each category's academic sections
 * get finished in.
 *
 * @param {import('mongoose').Model} TestModel - the Test model (passed in
 *   to avoid a circular import between this file and models/Test.js)
 * @param {import('mongoose').Types.ObjectId} categoryId
 * @param {number} testNumber
 * @param {import('mongoose').ClientSession} session
 * @returns {Promise<object>} the Test document (existing or newly created)
 */
export async function getOrCreateSiblingTest(TestModel, categoryId, testNumber, session) {
  let test = await TestModel.findOne({
    category:   categoryId,
    testNumber,
  }).session(session);

  if (!test) {
    const created = await TestModel.create(
      [{ category: categoryId, testNumber }],
      { session }
    );
    test = created[0];
  }

  return test;
}

/**
 * getSectionStatus(test)
 *
 * Given a Test document (or plain object with a `sections` field),
 * returns the `nextRequired` string the section the admin must
 * fill in next to complete the test.
 *
 * Ordering is fixed and intentional:
 *   1. verbal     always first
 *   2. nonVerbal  second
 *   3. academic   third
 *
 * If all three are complete, returns 'complete'.
 *
 * @param {object} test  - Mongoose Test document or plain object
 * @returns {'verbal' | 'nonVerbal' | 'academic' | 'complete'}
 */
export function getSectionStatus(test) {
  const { verbal, nonVerbal, academic } = test.sections;

  if (verbal.status !== "complete")    return "verbal";
  if (nonVerbal.status !== "complete") return "nonVerbal";
  if (academic.status !== "complete")  return "academic";

  return "complete";
}

/**
 * formatSectionStatusResponse(test)
 *
 * Builds the full response object returned by the section-status endpoint.
 * Centralised here so all callers produce the same shape.
 *
 * @param {object} test  - Mongoose Test document or plain object
 * @returns {object}     - { testId, verbal, nonVerbal, academic, nextRequired }
 */
export function formatSectionStatusResponse(test) {
  const nextRequired = getSectionStatus(test);

  return {
    testId:       test._id,
    verbal:       { status: test.sections.verbal.status },
    nonVerbal:    { status: test.sections.nonVerbal.status },
    academic:     { status: test.sections.academic.status },
    nextRequired,
  };
}

/**
 * getFreeMockSectionStatus(test)
 *
 * Mirror of getSectionStatus() but for FreeMockTest documents.
 *
 * Determines which section the admin needs to fill next for a
 * Free Mock Test. Ordering is identical to premium tests:
 *   1. verbal
 *   2. nonVerbal
 *   3. academic
 *
 * @param {object} test  - FreeMockTest document or plain object
 * @returns {'verbal' | 'nonVerbal' | 'academic' | 'complete'}
 */
export function getFreeMockSectionStatus(test) {
  const { verbal, nonVerbal, academic } = test.sections;

  if (verbal.status !== "complete")    return "verbal";
  if (nonVerbal.status !== "complete") return "nonVerbal";
  if (academic.status !== "complete")  return "academic";

  return "complete";
}

/**
 * formatFreeMockSectionStatusResponse(test)
 *
 * Builds the full response object for Free Mock Test section-status endpoints.
 *
 * @param {object} test  - FreeMockTest document or plain object
 * @returns {object}     - { testId, verbal, nonVerbal, academic, nextRequired }
 */
export function formatFreeMockSectionStatusResponse(test) {
  const nextRequired = getFreeMockSectionStatus(test);

  return {
    testId:       test._id,
    verbal:       { status: test.sections.verbal.status },
    nonVerbal:    { status: test.sections.nonVerbal.status },
    academic:     { status: test.sections.academic.status },
    nextRequired,
  };
}
