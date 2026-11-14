-- Banque Lumen (fictive) : la table des agences, pour Azure SQL Database.
-- Généré par generer_donnees.py : ne pas modifier à la main.

IF OBJECT_ID('dbo.agences', 'U') IS NOT NULL DROP TABLE dbo.agences;
CREATE TABLE dbo.agences (
    agence_id    CHAR(4)       NOT NULL PRIMARY KEY,
    nom          NVARCHAR(60)  NOT NULL,
    ville        NVARCHAR(40)  NOT NULL,
    code_postal  CHAR(5)       NOT NULL,
    region       NVARCHAR(40)  NOT NULL,
    date_ouverture DATE        NOT NULL
);

INSERT INTO dbo.agences (agence_id, nom, ville, code_postal, region, date_ouverture) VALUES
    ('AG01', N'Lumen Paris Opéra', N'Paris', '75009', N'Île-de-France', '2012-11-24'),
    ('AG02', N'Lumen Paris Bastille', N'Paris', '75011', N'Île-de-France', '2003-03-15'),
    ('AG03', N'Lumen La Défense', N'Puteaux', '92800', N'Île-de-France', '2010-01-13'),
    ('AG04', N'Lumen Versailles', N'Versailles', '78000', N'Île-de-France', '1998-10-04'),
    ('AG05', N'Lumen Créteil', N'Créteil', '94000', N'Île-de-France', '2017-03-12'),
    ('AG06', N'Lumen Lyon Part-Dieu', N'Lyon', '69003', N'Auvergne-Rhône-Alpes', '2002-09-29'),
    ('AG07', N'Lumen Lyon Presqu''île', N'Lyon', '69002', N'Auvergne-Rhône-Alpes', '2008-05-27'),
    ('AG08', N'Lumen Grenoble', N'Grenoble', '38000', N'Auvergne-Rhône-Alpes', '2011-02-23'),
    ('AG09', N'Lumen Clermont-Ferrand', N'Clermont-Ferrand', '63000', N'Auvergne-Rhône-Alpes', '2007-03-17'),
    ('AG10', N'Lumen Marseille Vieux-Port', N'Marseille', '13001', N'Provence-Alpes-Côte d''Azur', '2005-12-06'),
    ('AG11', N'Lumen Nice', N'Nice', '06000', N'Provence-Alpes-Côte d''Azur', '1999-12-18'),
    ('AG12', N'Lumen Toulon', N'Toulon', '83000', N'Provence-Alpes-Côte d''Azur', '1998-02-23'),
    ('AG13', N'Lumen Toulouse Capitole', N'Toulouse', '31000', N'Occitanie', '2012-03-19'),
    ('AG14', N'Lumen Montpellier', N'Montpellier', '34000', N'Occitanie', '2001-08-09'),
    ('AG15', N'Lumen Bordeaux', N'Bordeaux', '33000', N'Nouvelle-Aquitaine', '2009-02-17'),
    ('AG16', N'Lumen Limoges', N'Limoges', '87000', N'Nouvelle-Aquitaine', '2018-11-08'),
    ('AG17', N'Lumen Nantes', N'Nantes', '44000', N'Pays de la Loire', '2005-01-21'),
    ('AG18', N'Lumen Angers', N'Angers', '49000', N'Pays de la Loire', '2001-06-07'),
    ('AG19', N'Lumen Rennes', N'Rennes', '35000', N'Bretagne', '2004-02-22'),
    ('AG20', N'Lumen Brest', N'Brest', '29200', N'Bretagne', '2011-01-03'),
    ('AG21', N'Lumen Lille', N'Lille', '59000', N'Hauts-de-France', '2008-07-19'),
    ('AG22', N'Lumen Amiens', N'Amiens', '80000', N'Hauts-de-France', '2000-02-02'),
    ('AG23', N'Lumen Strasbourg', N'Strasbourg', '67000', N'Grand Est', '1997-04-06'),
    ('AG24', N'Lumen Nancy', N'Nancy', '54000', N'Grand Est', '2019-05-23');
