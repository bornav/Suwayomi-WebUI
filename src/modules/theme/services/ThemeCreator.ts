/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    createTheme as createMuiTheme,
    darken,
    Direction,
    lighten,
    responsiveFontSizes,
    Theme,
    TypeBackground,
    useTheme,
} from '@mui/material/styles';
import { useCallback } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies,no-restricted-imports
import { deepmerge } from '@mui/utils';
// eslint-disable-next-line no-restricted-imports
import { PaletteBackgroundChannel } from '@mui/material/styles/createThemeWithVars';
import { ThemeMode } from '@/modules/theme/contexts/ThemeModeContext.tsx';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { AppTheme, loadThemeFonts } from '@/modules/theme/services/AppThemes.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';

const SCROLLBAR_SIZE = 14;

declare module '@mui/material/styles' {
    interface CssThemeVariables {
        enabled: true;
    }
}

const getBackgroundColor = (
    type: 'light' | 'dark',
    appTheme: AppTheme,
    theme: Theme,
    setPureBlackMode: boolean = false,
): (Partial<TypeBackground> & Partial<PaletteBackgroundChannel>) | undefined => {
    if (setPureBlackMode) {
        return {
            paper: '#111',
            default: '#000',
        };
    }

    if (type === 'light' && !!theme.colorSchemes.light) {
        if (
            typeof appTheme.muiTheme.colorSchemes?.light === 'object' &&
            appTheme.muiTheme.colorSchemes.light.palette?.background
        ) {
            return appTheme.muiTheme.colorSchemes.light.palette.background;
        }

        return {
            paper: lighten(theme.colorSchemes.light.palette.primary.dark, 0.8),
            default: lighten(theme.colorSchemes.light.palette.primary.dark, 0.9),
        };
    }

    if (type === 'dark' && !!theme.colorSchemes.dark) {
        if (
            typeof appTheme.muiTheme.colorSchemes?.dark === 'object' &&
            appTheme.muiTheme.colorSchemes.dark.palette?.background
        ) {
            return appTheme.muiTheme.colorSchemes.dark.palette.background;
        }

        return {
            paper: darken(theme.colorSchemes.dark.palette.primary.dark, 0.8),
            default: darken(theme.colorSchemes.dark.palette.primary.dark, 0.9),
        };
    }

    return undefined;
};

export const createTheme = (
    themeMode: ThemeMode,
    appTheme: AppTheme,
    pureBlackMode: boolean = false,
    direction: Direction = 'ltr',
) => {
    const systemMode = MediaQuery.getSystemThemeMode();

    const mode = themeMode === ThemeMode.SYSTEM ? systemMode : themeMode;
    const isDarkMode = mode === ThemeMode.DARK;
    const setPureBlackMode = isDarkMode && pureBlackMode;

    const themeForColors = createMuiTheme({ ...appTheme.muiTheme, defaultColorScheme: mode });

    const suwayomiTheme = createMuiTheme(
        deepmerge(appTheme.muiTheme, {
            defaultColorScheme: mode,
            direction,
            colorSchemes: {
                light: appTheme.muiTheme.colorSchemes?.light
                    ? {
                          palette: {
                              background: getBackgroundColor('light', appTheme, themeForColors),
                          },
                      }
                    : undefined,
                dark: appTheme.muiTheme.colorSchemes?.dark
                    ? {
                          palette: {
                              background: getBackgroundColor('dark', appTheme, themeForColors, setPureBlackMode),
                          },
                      }
                    : undefined,
            },
            components: {
                ...appTheme.muiTheme.components,
                MuiUseMediaQuery: {
                    defaultProps: {
                        noSsr: true,
                    },
                },
                MuiCssBaseline: {
                    ...appTheme.muiTheme.components?.MuiCssBaseline,
                    styleOverrides:
                        typeof appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides === 'object'
                            ? {
                                  ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides,
                                  '*::-webkit-scrollbar': applyStyles(CSS.supports('-webkit-touch-callout', 'none'), {
                                      width: `${SCROLLBAR_SIZE}px`,
                                      height: `${SCROLLBAR_SIZE}px`,
                                      // @ts-ignore - '*::-webkit-scrollbar' is a valid key
                                      ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                          '*::-webkit-scrollbar'
                                      ],
                                  }),
                                  '*::-webkit-scrollbar-thumb': applyStyles(
                                      CSS.supports('-webkit-touch-callout', 'none'),
                                      {
                                          border: '4px solid rgba(0, 0, 0, 0)',
                                          backgroundClip: 'padding-box',
                                          borderRadius: '9999px',
                                          backgroundColor: `${themeForColors.palette.primary[isDarkMode ? 'dark' : 'light']}`,
                                          // @ts-ignore - '*::-webkit-scrollbar-thumb' is a valid key
                                          ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                              '*::-webkit-scrollbar-thumb'
                                          ],
                                      },
                                  ),
                                  '*::-webkit-scrollbar-thumb:hover': applyStyles(
                                      CSS.supports('-webkit-touch-callout', 'none'),
                                      {
                                          borderWidth: '2px',
                                          // @ts-ignore - '*::-webkit-scrollbar-thumb:hover' is a valid key
                                          ...appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides?.[
                                              '*::-webkit-scrollbar-thumb:hover'
                                          ],
                                      },
                                  ),
                              }
                            : `
                        @supports not (-webkit-touch-callout: none) {
                          /* CSS for other than iOS devices */ 
                          *::-webkit-scrollbar {
                            width: ${SCROLLBAR_SIZE}px;
                            height: ${SCROLLBAR_SIZE}px;
                          }
                          *::-webkit-scrollbar-thumb {
                            border: 4px solid rgba(0, 0, 0, 0);
                            background-clip: padding-box;
                            border-radius: 9999px;
                            background-color: ${themeForColors.palette.primary[isDarkMode ? 'dark' : 'light']};
                          }
                          *::-webkit-scrollbar-thumb:hover {
                            border-width: 2px;
                          }
                          
                          ${appTheme.muiTheme.components?.MuiCssBaseline?.styleOverrides ?? ''}
                        }
                    `,
                },
            },
        }),
    );

    return responsiveFontSizes(suwayomiTheme);
};

let theme: Theme;
export const getCurrentTheme = () => theme;
export const createAndSetTheme = (...args: Parameters<typeof createTheme>) => {
    theme = createTheme(...args);
    loadThemeFonts(theme).catch(defaultPromiseErrorHandler('theme::createAndSetTheme'));

    return theme;
};

export const getOptionForDirection = <T>(
    ltrOption: T,
    rtlOption: T,
    direction: Theme['direction'] = theme?.direction ?? 'ltr',
): T => (direction === 'ltr' ? ltrOption : rtlOption);

export const useGetOptionForDirection = (): typeof getOptionForDirection => {
    const muiTheme = useTheme();

    return useCallback(
        <T>(...args: Parameters<typeof getOptionForDirection<T>>) => getOptionForDirection(...args),
        [muiTheme.direction],
    );
};
