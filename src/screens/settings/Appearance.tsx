/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { ThemeMode, ThemeModeContext } from '@/components/context/ThemeModeContext.tsx';
import { Select } from '@/components/atoms/Select.tsx';

export const Appearance = () => {
    const { t } = useTranslation();
    const { themeMode, setThemeMode } = useContext(ThemeModeContext);

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('settings.appearance.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    return (
        <List
            subheader={
                <ListSubheader component="div" id="appearance-theme">
                    {t('settings.appearance.theme')}
                </ListSubheader>
            }
        >
            <ListItem>
                <ListItemText primary={t('settings.appearance.device_theme')} />
                <Select<ThemeMode> value={themeMode} onChange={(e) => setThemeMode(e.target.value as ThemeMode)}>
                    <MenuItem key={ThemeMode.SYSTEM} value={ThemeMode.SYSTEM}>
                        System
                    </MenuItem>
                    <MenuItem key={ThemeMode.DARK} value={ThemeMode.DARK}>
                        Dark
                    </MenuItem>
                    <MenuItem key={ThemeMode.LIGHT} value={ThemeMode.LIGHT}>
                        Light
                    </MenuItem>
                </Select>
            </ListItem>
        </List>
    );
};