# Uusi tietomalli (proposed)

## Folder
- `id`, `name`, `sportId`, `ownerId`, `createdAt`

## Membership
- `folderId`, `userId`, `role` (`owner | admin | coach | viewer`), `invitedBy`

## Evaluation
- `id`, `folderId`, `title`, `sportId`, `mode` (`light | deep`), `participantIds`, `sharedWithStudentIds`

## Rubric
- `id`, `sportId`, `name`, `criteria[]`
- `criteria`: `id`, `label`, `weight`, `levels[]`

## JudgeResult
- `evaluationId`, `judgeId`, `placements[]`, `rubricScoreByParticipant`

## Comment
- `id`, `evaluationId`, `authorId`, `body`, `createdAt`
