import { Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import CharacterParticipationList from "../../components/CharacterParticipationList";
import { api } from "../../services/api";

import { useStyles } from './styles';

type Participation = {
    id: number;
    title: string;
    thumbnail: string;
    details: string;
}

interface CharacterProps {
    character: {
        id: number;
        name: string;
        description: string;
        thumbnail: string;
        comics: Participation[];
        series: Participation[];
        events: Participation[];
    }
}

export default function Character({ character }: CharacterProps) {
    const classes = useStyles();

    return (
        <>
            <Head>
                <title>{ character.name } | Marvel</title>
            </Head>
            <Container className={classes.root}>
                <Box>
                    <Link href="/" passHref>
                        <Button variant="outlined">	&#9664; Go Back</Button>
                    </Link>
                </Box>
                <Grid 
                    container 
                    spacing={5} 
                    className={classes.header} 
                    component="header"
                >
                    <Grid 
                        item 
                        md={3} 
                        className={classes.characterImage}
                    >
                        <Image 
                            src={character.thumbnail} 
                            width="300" 
                            height="450" 
                            alt={character.name} 
                        />
                    </Grid>
                    <Grid item md={9}>
                        <Typography variant="h1" align="center">
                            {character.name}
                        </Typography>
                        <Typography variant="body1">
                            {character.description}
                        </Typography>
                    </Grid>
                </Grid>
                <Box component="section" className={classes.section}>
                    <Box component="header">
                        <Typography variant="h2" noWrap>
                            Comics
                        </Typography>
                    </Box>
                    <CharacterParticipationList participations={character.comics} />
                </Box>
                <Box component="section" className={classes.section}>
                    <Box component="header">
                        <Typography variant="h2" noWrap>
                            Series
                        </Typography>
                    </Box>
                    <CharacterParticipationList participations={character.series} />
                </Box>
                <Box component="section" className={classes.section}>
                    <Box component="header">
                        <Typography variant="h2" noWrap>
                            Events
                        </Typography>
                    </Box>
                    <CharacterParticipationList participations={character.events} />
                </Box>
            </Container>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            { params: { characterId: '1' } },
        ],
        fallback: true,
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const { characterId } = params;

    const getCharacter = await api.get(`/characters/${characterId}`, {
        params: {
            ts: process.env.MARVEL_TS,
            apikey: process.env.MARVEL_PUBLIC_KEY,
            hash: process.env.MARVEL_HASH_MD5,
        }
    }).then(response => (response.data.data.results[0]));
    const getCharacterComic = await api.get(`/characters/${characterId}/comics`, {
        params: {
            ts: process.env.MARVEL_TS,
            apikey: process.env.MARVEL_PUBLIC_KEY,
            hash: process.env.MARVEL_HASH_MD5,
        }
    }).then(response => (response.data.data.results));
    const getCharacterSerie = await api.get(`/characters/${characterId}/series`, {
        params: {
            ts: process.env.MARVEL_TS,
            apikey: process.env.MARVEL_PUBLIC_KEY,
            hash: process.env.MARVEL_HASH_MD5,
        }
    }).then(response => (response.data.data.results));
    const getCharacterEvent = await api.get(`/characters/${characterId}/events`, {
        params: {
            ts: process.env.MARVEL_TS,
            apikey: process.env.MARVEL_PUBLIC_KEY,
            hash: process.env.MARVEL_HASH_MD5,
        }
    }).then(response => (response.data.data.results));
    
    const character = {
        id: getCharacter.id,
        name: getCharacter.name,
        description: getCharacter.description,
        thumbnail: `${getCharacter.thumbnail.path}/portrait_uncanny.${getCharacter.thumbnail.extension}`,
        comics: getCharacterComic.map(comic => {
            return {
                id: comic.id,
                title: comic.title,
                thumbnail: `${comic.thumbnail.path}/portrait_xlarge.${comic.thumbnail.extension}`,
                details: comic.urls[0].url,
            }
        }),
        series: getCharacterSerie.map(serie => {
            return {
                id: serie.id,
                title: serie.title,
                thumbnail: `${serie.thumbnail.path}/portrait_xlarge.${serie.thumbnail.extension}`,
                details: serie.urls[0].url
            }
        }),
        events: getCharacterEvent.map(event => {
            return {
                id: event.id,
                title: event.title,
                thumbnail: `${event.thumbnail.path}/portrait_xlarge.${event.thumbnail.extension}`,
                details: event.urls[0].url
            }
        }),
    };

    return { 
        props: {
            character,
        },
        revalidate: 60 * 60 * 24,
    };
}