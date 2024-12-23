/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RefObject, useEffect } from 'react';
import { ReaderProgressBarProps, TReaderProgressCurrentPage } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { getOptionForDirection as getOptionForDirectionImpl } from '@/modules/theme/services/ThemeCreator.ts';
import { ProgressBarPosition } from '@/modules/reader/types/Reader.types.ts';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';

export const getPage = (pageIndex: number, pages: ReaderProgressBarProps['pages']): TReaderProgressCurrentPage => {
    const pagesIndex = pages.findIndex(({ primary, secondary }) =>
        [primary.index, secondary?.index].includes(pageIndex),
    );
    const page = pages[pagesIndex];
    return {
        ...page,
        pagesIndex,
    };
};

/**
 * for the double page mode the secondary page index has to be used to be able to correctly detect if the last page is visible
 *
 */
export const getNextIndexFromPage = (page: ReaderProgressBarProps['pages'][number]) =>
    page.secondary?.index ?? page.primary.index;

export const getNextPageIndex = (
    offset: 'previous' | 'next',
    pagesIndex: number,
    pages: ReaderProgressBarProps['pages'],
): number => {
    switch (offset) {
        case 'previous':
            return getNextIndexFromPage(pages[Math.max(0, pagesIndex - 1)]);
        case 'next':
            return getNextIndexFromPage(pages[Math.min(pages.length - 1, pagesIndex + 1)]);
        default:
            throw new Error(`Unexpected offset "${offset}"`);
    }
};

export const getPageForMousePos = (
    coordinates: { clientX: number; clientY: number },
    elementRect: DOMRect,
    pages: ReaderProgressBarProps['pages'],
    isHorizontalPosition: boolean,
    getOptionForDirection: typeof getOptionForDirectionImpl,
): ReaderProgressBarProps['pages'][number] => {
    const pos = isHorizontalPosition ? coordinates.clientX : coordinates.clientY;
    const rectPos = isHorizontalPosition ? elementRect.left : elementRect.top;
    const rectSize = isHorizontalPosition ? elementRect.width : elementRect.height;

    const mouseXPosRelativeToProgressBar = pos - rectPos;
    const pageForMouseXPos = Math.ceil((mouseXPosRelativeToProgressBar / rectSize) * pages.length);
    const minPage = Math.max(1, pageForMouseXPos);
    const maxPage = Math.min(minPage, pages.length);
    const newPageIndex = getOptionForDirection(maxPage - 1, pages.length - maxPage);

    return pages[newPageIndex];
};

export const getProgressBarPositionInfo = (
    position: ProgressBarPosition,
): {
    isBottom: boolean;
    isLeft: boolean;
    isRight: boolean;
    isHorizontal: boolean;
    isVertical: boolean;
} => {
    const isBottom = position === ProgressBarPosition.BOTTOM;
    const isLeft = position === ProgressBarPosition.LEFT;
    const isRight = position === ProgressBarPosition.RIGHT;
    const isHorizontal = isBottom;
    const isVertical = isLeft || isRight;

    return {
        isBottom,
        isLeft,
        isRight,
        isHorizontal,
        isVertical,
    };
};

export const useHandleProgressDragging = (
    openPage: ReturnType<(typeof ReaderControls)['useOpenPage']>,
    progressBarRef: RefObject<HTMLDivElement | null>,
    isDragging: boolean,
    currentPage: TReaderProgressCurrentPage,
    pages: ReaderProgressBarProps['pages'],
    progressBarPosition: ProgressBarPosition,
    getOptionForDirection: typeof getOptionForDirectionImpl,
) => {
    useEffect(() => {
        if (!isDragging) {
            return () => undefined;
        }

        const { isHorizontal } = getProgressBarPositionInfo(progressBarPosition);

        const handleMove = (coordinates: { clientX: number; clientY: number }) => {
            if (!progressBarRef.current) {
                return;
            }

            const newPageIndex = getNextIndexFromPage(
                getPageForMousePos(
                    coordinates,
                    progressBarRef.current.getBoundingClientRect(),
                    pages,
                    isHorizontal,
                    getOptionForDirection,
                ),
            );

            const hasCurrentPageIndexChanged = getNextIndexFromPage(currentPage) !== newPageIndex;
            if (!hasCurrentPageIndexChanged) {
                return;
            }

            openPage(newPageIndex, undefined, false);
        };

        const handleMouseMove = (e: MouseEvent) => {
            handleMove(e);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handleMove(e.touches[0]);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [openPage, isDragging, currentPage, pages, progressBarPosition]);
};
