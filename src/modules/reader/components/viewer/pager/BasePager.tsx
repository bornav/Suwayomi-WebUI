/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect, useMemo, useRef } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { getImageWidthStyling, getPageIndexesToLoad } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { ReaderPagerProps, ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';
import { ReaderTransitionPage } from '@/modules/reader/components/viewer/ReaderTransitionPage.tsx';

export const BasePager = ({
    currentPageIndex,
    pages,
    transitionPageMode,
    imageRefs,
    createPage,
    slots,
}: Omit<ReaderPagerProps, 'pageLoadStates' | 'retryFailedPagesKeyPrefix'> & {
    createPage: (
        page: ReaderStatePages['pages'][number],
        pagesIndex: number,
        shouldLoad: boolean,
        shouldDisplay: boolean,
        setRef: (element: HTMLElement | null) => void,
    ) => ReactNode;
    slots?: { boxProps?: BoxProps };
}) => {
    const { readingMode, pageScaleMode, shouldStretchPage, readerWidth, imagePreLoadAmount } =
        ReaderService.useSettings();

    const previousCurrentPageIndex = useRef(-1);
    const pagesIndexesToRender = useMemo(
        () => getPageIndexesToLoad(currentPageIndex, pages, previousCurrentPageIndex.current, imagePreLoadAmount),
        [currentPageIndex, pages, imagePreLoadAmount],
    );
    useEffect(() => {
        previousCurrentPageIndex.current = currentPageIndex;
    }, [pagesIndexesToRender]);

    return (
        <Box
            {...slots?.boxProps}
            sx={[
                ...(Array.isArray(slots?.boxProps?.sx) ? (slots?.boxProps?.sx ?? []) : [slots?.boxProps?.sx]),
                getImageWidthStyling(
                    readingMode.value,
                    shouldStretchPage.value,
                    pageScaleMode.value,
                    false,
                    readerWidth.value,
                ),
            ]}
        >
            <ReaderTransitionPage
                type={ReaderTransitionPageMode.PREVIOUS}
                mode={transitionPageMode}
                readingMode={readingMode.value}
                pageScaleMode={pageScaleMode.value}
            />
            {pages.map((page, pagesIndex) =>
                createPage(
                    page,
                    pagesIndex,
                    pagesIndexesToRender.includes(pagesIndex),
                    [ReaderTransitionPageMode.NONE, ReaderTransitionPageMode.BOTH].includes(transitionPageMode),
                    (element) => {
                        // eslint-disable-next-line no-param-reassign
                        imageRefs.current[pagesIndex] = element;
                    },
                ),
            )}
            <ReaderTransitionPage
                type={ReaderTransitionPageMode.NEXT}
                mode={transitionPageMode}
                readingMode={readingMode.value}
                pageScaleMode={pageScaleMode.value}
            />
        </Box>
    );
};
