/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { NullAndUndefined } from '@/Base.types.ts';
import { MangaStatus, MangaType, TrackerType } from '@/lib/graphql/generated/graphql.ts';
import { GridLayout } from '@/modules/core/Core.types.ts';

export type MetadataLibrarySettings = {
    showAddToLibraryCategorySelectDialog: boolean;
    ignoreFilters: boolean;
    removeMangaFromCategories: boolean;
    showTabSize: boolean;
};
export type LibrarySortMode =
    | 'unreadChapters'
    | 'totalChapters'
    | 'alphabetically'
    | 'dateAdded'
    | 'lastRead'
    | 'latestFetchedChapter'
    | 'latestUploadedChapter';

export interface LibraryOptions {
    // display options
    showContinueReadingButton: boolean;
    showDownloadBadge: boolean;
    showUnreadBadge: boolean;
    gridLayout: GridLayout;

    // sort options
    sortBy: NullAndUndefined<LibrarySortMode>;
    sortDesc: NullAndUndefined<boolean>;

    // filter options
    hasDownloadedChapters: NullAndUndefined<boolean>;
    hasBookmarkedChapters: NullAndUndefined<boolean>;
    hasUnreadChapters: NullAndUndefined<boolean>;
    hasDuplicateChapters: NullAndUndefined<boolean>;
    hasTrackerBinding: Record<TrackerType['id'], NullAndUndefined<boolean>>;
    hasStatus: Record<MangaStatus, NullAndUndefined<boolean>>;
}

export type TMangaDuplicate = Pick<MangaType, 'id' | 'title' | 'description'>;

export type TMangaDuplicates<Manga> = Record<string, Manga[]>;

export type TMangaDuplicateResult<Manga> = { byTitle: Manga[]; byAlternativeTitle: Manga[] };

export type LibraryDuplicatesWorkerInput<Manga extends TMangaDuplicate = TMangaDuplicate> = {
    mangas: Manga[];
    checkAlternativeTitles: boolean;
};

export type LibraryDuplicatesDescriptionWorkerInput<Manga extends TMangaDuplicate = TMangaDuplicate> = {
    mangasToCheck: Manga[];
    mangas: Manga[];
};