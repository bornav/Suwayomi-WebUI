/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Direction, StyledEngineProvider, ThemeProvider, useColorScheme } from '@mui/material/styles';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { useTranslation } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import { SnackbarProvider } from 'notistack';
import { createAndSetTheme } from '@/modules/theme/services/ThemeCreator.ts';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { ThemeMode, ThemeModeContext } from '@/modules/theme/contexts/ThemeModeContext.tsx';
import { NavBarContextProvider } from '@/modules/navigation-bar/contexts/NavBarContextProvider.tsx';
import { LibraryOptionsContextProvider } from '@/modules/library/contexts/LibraryOptionsProvider.tsx';
import { ActiveDeviceContextProvider } from '@/modules/device/contexts/DeviceContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { AppThemes, getTheme } from '@/modules/theme/services/AppThemes.ts';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { ReaderContextProvider } from '@/modules/reader/contexts/ReaderContextProvider.tsx';
import { DIRECTION_TO_CACHE } from '@/modules/theme/ThemeDirectionCache.ts';
import { AppHotkeysProvider } from '@/modules/hotkeys/contexts/AppHotkeysProvider.tsx';
import { SnackbarWithDescription } from '@/modules/core/components/snackbar/SnackbarWithDescription.tsx';

interface Props {
    children: React.ReactNode;
}

export const AppContext: React.FC<Props> = ({ children }) => {
    const directionRef = useRef<Direction>('ltr');
    const { i18n } = useTranslation();

    const currentDirection = i18n.dir();

    if (directionRef.current !== currentDirection) {
        document.dir = currentDirection;
        directionRef.current = currentDirection;
    }

    const {
        settings: { customThemes },
    } = useMetadataServerSettings();

    const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(MediaQuery.getSystemThemeMode());
    useLayoutEffect(() => {
        const unsubscribe = MediaQuery.listenToSystemThemeChange(setSystemThemeMode);

        return () => unsubscribe();
    }, []);

    const [appTheme, setAppTheme] = useLocalStorage<AppThemes>('appTheme', 'default');
    const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('themeMode', ThemeMode.SYSTEM);
    const [pureBlackMode, setPureBlackMode] = useLocalStorage<boolean>('pureBlackMode', false);

    const { mode } = useColorScheme();
    const actualThemeMode = mode ?? themeMode ?? 'dark';

    const darkThemeContext = useMemo(
        () => ({
            appTheme,
            setAppTheme,
            themeMode,
            setThemeMode,
            pureBlackMode,
            setPureBlackMode,
        }),
        [themeMode, pureBlackMode, appTheme],
    );

    const theme = useMemo(
        () =>
            createAndSetTheme(
                actualThemeMode as ThemeMode,
                getTheme(appTheme, customThemes),
                pureBlackMode,
                currentDirection,
            ),
        [actualThemeMode, currentDirection, systemThemeMode, pureBlackMode, appTheme, customThemes],
    );

    return (
        <Router>
            <StyledEngineProvider injectFirst>
                <CacheProvider value={DIRECTION_TO_CACHE[currentDirection]}>
                    <ThemeProvider theme={theme}>
                        <ThemeModeContext.Provider value={darkThemeContext}>
                            <QueryParamProvider adapter={ReactRouter6Adapter}>
                                <LibraryOptionsContextProvider>
                                    <NavBarContextProvider>
                                        <ActiveDeviceContextProvider>
                                            <SnackbarProvider
                                                Components={{
                                                    default: SnackbarWithDescription,
                                                    info: SnackbarWithDescription,
                                                    success: SnackbarWithDescription,
                                                    warning: SnackbarWithDescription,
                                                    error: SnackbarWithDescription,
                                                }}
                                            >
                                                <ReaderContextProvider>
                                                    <AppHotkeysProvider>{children}</AppHotkeysProvider>
                                                </ReaderContextProvider>
                                            </SnackbarProvider>
                                        </ActiveDeviceContextProvider>
                                    </NavBarContextProvider>
                                </LibraryOptionsContextProvider>
                            </QueryParamProvider>
                        </ThemeModeContext.Provider>
                    </ThemeProvider>
                </CacheProvider>
            </StyledEngineProvider>
        </Router>
    );
};
