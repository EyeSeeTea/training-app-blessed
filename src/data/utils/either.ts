import { Either as PurifyEither } from "purify-ts/Either";
import { Either } from "../../domain/entities/Either";

export function fromPurify<E, D>(purifyEither: PurifyEither<E, D>): Either<E, D> {
    return purifyEither.caseOf({
        Right: value => Either.success<E, D>(value),
        Left: err => Either.error<E>(err),
    });
}
