## Branch = simpleCorrNoImpact

# Extracting specific part from timestamp. ## ***** https://modern-sql.com/feature/extract
## On date -- https://dataschool.com/learn-sql/dates/

import esda
from esda.moran import Moran_Local
from esda.moran import Moran
from splot.esda import plot_moran, moran_scatterplot, lisa_cluster
import geopandas as gpd
import libpysal as lps
import esda
from esda.moran import Moran_Local
from esda.moran import Moran
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from pandasql import sqldf
from sklearn import datasets
from datetime import datetime
import csv
from tkinter import *
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import glob
import os
from operator import itemgetter # for sorting list of lists
from tkinter import ttk
from matplotlib.backends.backend_tkagg import (FigureCanvasTkAgg, NavigationToolbar2Tk)
from matplotlib.backend_bases import key_press_handler

from matplotlib.figure import Figure
from scipy.stats import pearsonr
from scipy.stats import kendalltau
from scipy.stats import spearmanr
from shapely.geometry import Polygon
import shapely.wkt
import shapely.geometry
import json
from itertools import combinations
import itertools
import os
import re # for string formatting
import math
import sys
import operator
import psycopg2
from psycopg2 import sql ### https://www.psycopg.org/psycopg3/docs/api/sql.html#module-psycopg.sql
from flask import Flask, request
from flask import jsonify
from flask_cors import CORS
import dotenv
from dotenv import load_dotenv
import ast

import warnings
warnings.filterwarnings('ignore', '.*is deprecated.*', )
warnings.filterwarnings('ignore', '.*float.*', )
warnings.filterwarnings('ignore', '.*interpolation.*', )
warnings.filterwarnings('ignore', '.*Degrees.*', )
warnings.filterwarnings('ignore', '.*divide.*', )

load_dotenv()

Insight = ''
menu_Column1 = ''
menu_Column2 = 'Select any Column'
chart = ''
out_param = 1.5 #default

sorted_global_Corr_list = []
out_corr_list = []

single_corr = [] # to store single correlation values

columns_lst = [],

init_figure = Figure()
df_Mean_Buckets = pd.DataFrame()
#outliers_DF = pd.DataFrame()
buckets_corr_lst = []
buck_rnge_cnt = []
range_vals_lst = []
range_val_series = pd.Series([])
Inter_Buck_Sorted_corr_lst = []
#num_Buckets = 10
bucket_size2Bignored = -1

Dataset_Col_Associ_lst = []
init_figure = Figure()

datasets_Dict = {}


## Sydney CBD small
## 151.29159091554948 -33.8617044816662, 151.19335629672247 -33.86521168936821, 151.20384737251953 -33.896770074812736, 151.2979945592178 -33.890436711537966, 151.29159091554948 -33.8617044816662
## 'POLYGON(( 151.29159091554948 -33.8617044816662, 151.19335629672247 -33.86521168936821, 151.20384737251953 -33.896770074812736, 151.2979945592178 -33.890436711537966, 151.29159091554948 -33.8617044816662 ))'

## large polygon
## 'POLYGON(( 150.75389134450774 -33.59735137171584, 151.34643938711528 -33.766199181893704, 151.30784907341607 -34.06681311892785, 150.63189615926498 -34.00594964988948, 150.75389134450774 -33.59735137171584 ))'

app = Flask(__name__)
CORS(app)

######### ************ Simple Correlation ************** ##############
@app.route('/simple_corr/')
def simple_corr():
    dsName1, dsName2, sDate, eDate, spatialRange = input_params_simple()
    df_Scores = startSimpleCorrelation(dsName1, dsName2, sDate, eDate, spatialRange)
    
    print(df_Scores[['COLUMN1', 'COLUMN2', 'Score']].to_string(), file=sys.stderr)
    return df_Scores.to_json(orient = 'records')

def input_params_simple():
    return request.args.get('ds1'), request.args.get('ds2'), request.args.get('from'), request.args.get('to'), request.args.get('spatial')
  

########################################################################


######## ************* Spatial Correlation ************** ##############
@app.route('/spatial/global/')
def global_corr():
    dataset_type, d_column = input_params_spatial()
    gf_data = Fetch_N_dFrame_Spatial_Corr(dataset_type, d_column)
    return Spatial_Corr_global(gf_data, dataset_type, d_column)

@app.route('/spatial/local/')
def local_corr():
    dataset_type, d_column = input_params_spatial()
    gf_data = Fetch_N_dFrame_Spatial_Corr(dataset_type, d_column)
    return Spatial_Corr_local(gf_data, dataset_type,d_column)


@app.route('/spatial/plot/')
def plot_data():
    dataset_type, d_column = input_params_spatial()
    #Fetch_N_dFrame(dataset_type, d_column)
    gf_data = Fetch_N_dFrame_Spatial_Corr(dataset_type, d_column)
    plotting(gf_data, dataset_type, d_column)
    return "Plotting Done!!"


def input_params_spatial():
    dataset_type = request.args.get('dataset')
    d_column = request.args.get('col')

    return dataset_type, d_column

#########################################################################




## ********************************************************* ##
############ START Simple Correlation #########################
## ********************************************************* ##



def startSimpleCorrelation(dsName1, dsName2, sDate, eDate, spatialRange):

    num_Buckets = 10
    temGranularities = ['daily', 'monthly', 'yearly']
    #temGranularities = ['monthly']

    datasets_Dict = {'pollution': ['daily', 'monthly', 'yearly'], 'weather': ['daily', 'monthly', 'yearly'], 'trafficIncidents': ['daily', 'monthly', 'yearly'], 'crimes': ['monthly', 'yearly'] , 'trafficVolume': ['daily', 'monthly', 'yearly'], 'emissions': ['yearly']}
    Score_DF = pd.DataFrame(columns = ['COLUMN1', 'COLUMN2', 'CORRELATION', 'Pvalue', '1-Pvalue', 'Score', 'numRows1', 'numRows2', 'uniqVals1', 'uniqVal12', 'num_Buckets', 'tGranularity' , 'DatasetPair', 'comparisonType']) 
    
    for tGranularity in temGranularities:
        #print(tGranularity)               
        ScoreList = mainCompDBPair(dsName1, dsName2, sDate, eDate, spatialRange, tGranularity, num_Buckets, datasets_Dict) # Cross DBs correlation computation
        if len(ScoreList) != 0:
            for item in ScoreList:
                #print(item)             
                Score_DF.loc[len(Score_DF)] = item # appending type at the end of the list and then add the row
    
    #print(Score_DF)
    Score_DF.sort_values(by=['Score'], ascending=False, inplace=True) # sorting on Score
    #Score_DF.to_csv("Scorelist_DF.csv")
        #print_Output(ScoreList, tGranularity, DbPair[0], DbPair[1], 2)
    #apply_PenaltyNSorting(Score_DF, 0.4) # No need for penalty if only two datasets coming
   
    return Score_DF

def mainCompDBPair(dsName1, dsName2, sDate, eDate, spatialRange, tGranularity, num_Buckets, datasets_Dict):

    dColsDFsList_d01 = []
    dColsDFsList_d02 = []
    ScoreList = []
    
    if tGranularity == 'daily':
        on_what = 'date'
    elif tGranularity == 'monthly':
        on_what = ['year', 'month']
    elif tGranularity == 'yearly':
        on_what = 'year'
    
    if tGranularity in datasets_Dict[dsName1] and tGranularity in datasets_Dict[dsName2]:
        #print("Same temporal granularity Found!...")               
        dColsDFsList_d01 = FetchData(dsName1, sDate, eDate, spatialRange, tGranularity)  # [colName, df_, tGranularity, dsName]
        
        if dsName1 != dsName2:
            dColsDFsList_d02 = FetchData(dsName2, sDate, eDate, spatialRange, tGranularity)            
            return crossDBCorrelation_Score(dColsDFsList_d01, dColsDFsList_d02, on_what, num_Buckets, 'Pearson', tGranularity, dsName1, dsName2) # will run for db1 and db2 if they are different                    
        else:
            return sameDBCorrelation_Score(dColsDFsList_d01, on_what, num_Buckets, 'Pearson', tGranularity, dsName1) # will run for same DB
       
    else:
        print("For the given two datasets, temporal granularity does not match!...")

    return ScoreList




def sameDBCorrelation_Score(dBColsDfs_01, on_what, num_Buckets, corr_Type, tGranularity, dsName1):
    ## dBColsDfs_01 = [colName, df_, tGranularity, dsName]
    colNamesList = []
    for item in dBColsDfs_01:
        colNamesList.append(item[0])

    colsCombinations = list(combinations(colNamesList, 2))
    #print("same data columns combinations: ", colsCombinations)

    SameDBScore_lst = []
    
    for colPair in colsCombinations:
        #print(colPair)
        colInfo_01 = []
        colInfo_02 = []
        if colPair[0] != colPair[1]:  #  comparing column names
            for item in dBColsDfs_01:
                if item[0] == colPair[0]:
                    #print("col1FoPair, df: ", colPair[0], item[0])
                    colInfo_01 = item
                if item[0] == colPair[1]:
                    #print("col2FoPair, df: ", colPair[1], item[0])
                    colInfo_02 = item

            #print("going to join.. ", colInfo_01[0], colInfo_02[0])
            df_Joined = join_DFs(colInfo_01, colInfo_02, on_what)
            # --->> Dropping date, year, month columns before computing correlation
            if on_what == 'date':
                df_Joined = df_Joined.drop(['date'], axis = 1)
            elif on_what == ['year', 'month']:
                df_Joined = df_Joined.drop(['year'], axis = 1)
                df_Joined = df_Joined.drop(['month'], axis = 1)
            elif on_what == 'year':
                df_Joined = df_Joined.drop(['year'], axis = 1)

            df_bucks_lst = col_bucket_df(df_Joined, num_Buckets) # each item is like --> (column, df_col_buck, numBins, len(uniq_val), len(df_num))
            Avg_corr, Avg_Pvalue, numBins1, numBins2, actualNumRow1, actualNumRow2, uniqVals1, uniqVals2 = comp_Correlation(colInfo_01[0], colInfo_02[0], corr_Type, df_bucks_lst)
            if Avg_corr >= 0.5:
                impact_col1 = 1 ## col_Impact(pair[0], corr_Type, columns_name)
                impact_col2 = 1 ## col_Impact(pair[1], corr_Type, columns_name)
                Significane = 1 - Avg_Pvalue

                Score = Significane # (0.5 * impact_col1 + 0.5 * impact_col2) * Significane #* abs(corr)
                #Score = 0.5 * (impact_col1 + impact_col2) + 0.5 * Significane #* abs(corr)    
                #penalty_list = [()]
                #print("pair indices from column indices list", columns_name.get_loc(pair[0]), columns_name.get_loc(pair[1]))
                #print("sig, Score: ", Significane, Score)
                SameDBScore_lst.append([colInfo_01[0], colInfo_02[0], Avg_corr, Avg_Pvalue, Significane, Score, actualNumRow1, actualNumRow2, uniqVals1, uniqVals2, num_Buckets, tGranularity, dsName1 + '-' + dsName1, 1])

    return SameDBScore_lst


def crossDBCorrelation_Score(dBColsDfs_01, dBColsDfs_02, on_what, num_Buckets, corr_Type, tGranularity, dsName1, dsName2):

    Score_lst = []
    for colInfo_01 in dBColsDfs_01:
        for colInfo_02 in dBColsDfs_02:
            if colInfo_01[0] != colInfo_02[0]:  #  comparing column names
                df_Joined = join_DFs(colInfo_01, colInfo_02, on_what)
                # --->> Dropping date, year, month columns before computing correlation
                if on_what == 'date':
                    df_Joined = df_Joined.drop(['date'], axis = 1)
                elif on_what == ['year', 'month']:
                    df_Joined = df_Joined.drop(['year'], axis = 1)
                    df_Joined = df_Joined.drop(['month'], axis = 1)
                elif on_what == 'year':
                    df_Joined = df_Joined.drop(['year'], axis = 1)

                df_bucks_lst = col_bucket_df(df_Joined, num_Buckets) # each item is like --> (column, df_col_buck, numBins, len(uniq_val), len(df_num))
                Avg_corr, Avg_Pvalue, numBins1, numBins2, actualNumRow1, actualNumRow2, uniqVals1, uniqVals2 = comp_Correlation(colInfo_01[0], colInfo_02[0], corr_Type, df_bucks_lst)
                if abs(Avg_corr) >= 0.5:
                    impact_col1 = 1 ## col_Impact(pair[0], corr_Type, columns_name)
                    impact_col2 = 1 ## col_Impact(pair[1], corr_Type, columns_name)
                    Significane = 1 - Avg_Pvalue

                    Score = Significane #(0.5 * impact_col1 + 0.5 * impact_col2) * Significane #* abs(corr)
                    #Score = 0.5 * (impact_col1 + impact_col2) + 0.5 * Significane #* abs(corr)    
                    #penalty_list = [()]
                    #print("pair indices from column indices list", columns_name.get_loc(pair[0]), columns_name.get_loc(pair[1]))
                    Score_lst.append([colInfo_01[0], colInfo_02[0], Avg_corr, Avg_Pvalue, Significane, Score, actualNumRow1, actualNumRow2, uniqVals1, uniqVals2, num_Buckets, tGranularity, dsName1 + '-' + dsName2, 2])

    return Score_lst


def join_DFs(colInfo_01, colInfo_02, on_what):
    #print("In Join_DFs...")
    ## colInfo_01 = [colName, df_, tGranularity, dsName, dbNum]
    ## on_what should be either 'date', ['year', 'month'], 'year'
    #print(colInfo_01[1])
    #print(colInfo_02[1])

    df_Joined = pd.merge(colInfo_01[1], colInfo_02[1], on=on_what, how='inner')
    
    #if on_what == ['year', 'month']:
    #print("joined_DFs")
    #print(df_Joined)
    
    #--->> remeber to handle issue where if sum(rain) e.g., is 0, it puts NaN there. but we want 0 there

    df_Joined = df_Joined.fillna(0) # NaN values in Df are actually 0 in the original database. But it might also replace 'None' which essentially is missing value
    df_Joined = df_Joined.dropna(how='any',axis=0) # will not drop 'None's now because they have been replaced with 0 now in row above
    df_Joined = df_Joined.apply(lambda col:pd.to_numeric(col, errors='coerce')) # changing the objects types

    return df_Joined



def FetchData(dsName, sDate, eDate, spatialRange, tGranularity):
    ## sample parameters
    '''
    sDate='2019-11-30'
    eDate='2021-11-30'
    item='CO'
    spatialRange = 'POLYGON(( 151.29159091554948 -33.8617044816662, 151.19335629672247 -33.86521168936821, 151.20384737251953 -33.896770074812736, 151.2979945592178 -33.890436711537966, 151.29159091554948 -33.8617044816662 ))'
    
    '''
    ## polygon format --> spatialRange = 'POLYGON(( 151.29159091554948 -33.8617044816662, 151.19335629672247 -33.86521168936821, 151.20384737251953 -33.896770074812736, 151.2979945592178 -33.890436711537966, 151.29159091554948 -33.8617044816662 ))'
    print("start dte: ", sDate, file=sys.stderr)
    dCols_df_lst = []
    np.set_printoptions(threshold=sys.maxsize)
    conn = psycopg2.connect(database=os.environ['DB_NAME'], user=os.environ['DB_USER'], password=os.environ['DB_PASSWORD'], host=os.environ['DB_HOST'], port= os.environ['DB_PORT'])
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor()

        
    if dsName == 'pollution':
        unique_cat_Q = "select distinct type from \"AirQualityReadings\""
        cursor.execute(unique_cat_Q)
        result = cursor.fetchall()
        col_List = []
        for i,row in enumerate(result):
            col_List.append(row[0]) # getting unique categories
        #col_List = ['CO', 'SO2', 'NO2', 'OZONE']
        for item in col_List:
            tuple1 = [item, sDate, eDate, spatialRange]
            query = ''

            if tGranularity == 'daily':
                query = sql.SQL("""select date, avg(value) as {field} from 
                    (select value, Date(date) as date from "AirQualityReadings" ar 
                    inner join "AirQualitySites" bs on ar."airQualitySiteId" = bs.id 
                    inner join "Suburbs" suburbs on suburbs.id = bs."suburbId" 
                    where type=%s and date(date) between date(%s) and date(%s) 
                    and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary)) as Temps 
                    group by date""").format(field=sql.Identifier(item))               

            elif tGranularity == 'monthly':
                query = sql.SQL("""select year, month, avg(value) {field} from 
                (select value, EXTRACT(year FROM date) AS year,  EXTRACT(month FROM date) AS month from "AirQualityReadings" ar 
                inner join "AirQualitySites" bs on ar."airQualitySiteId" = bs.id 
                inner join "Suburbs" suburbs on suburbs.id = bs."suburbId"
                where type=%s and date(date) between date(%s) and date(%s) 
                and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary)) as Temps 
                group by year, month order by year, month""").format(field=sql.Identifier(item))

            elif tGranularity == 'yearly':
                query = sql.SQL("""select year, avg(value) {field} from 
                (select value, EXTRACT(year FROM date) AS year from "AirQualityReadings" ar 
                inner join "AirQualitySites" bs on ar."airQualitySiteId" = bs.id 
                inner join "Suburbs" suburbs on suburbs.id = bs."suburbId"
                where type=%s and date(date) between date(%s) and date(%s) 
                and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary)) as Temps 
                group by year order by year""").format(field=sql.Identifier(item))

            cursor.execute(query, tuple1)
            column_names = [desc[0] for desc in cursor.description] # getting a list of column names
            #print(column_names)
            result = cursor.fetchall()
            df_pol_item = pd.DataFrame(result, columns = column_names)
            print(df_pol_item)

            dCols_df_lst.append([item, df_pol_item, tGranularity, dsName])


    
    elif dsName == 'weather':
        query = ''
        tuple1 = [sDate, eDate, spatialRange]
        if tGranularity == 'daily':
            query = """select date, min(temp) as min_temp, max(temp) as max_temp, avg(temp) as avg_temp, avg(clouds) as avg_clouds_amnt, max(gust) as max_wind_gust_kmh, 
            avg(pressure) as avg_pressure, max(nullif(rainfall, 'NaN')) as total_rainfall, avg(humidity) as avg_humidity, avg(windspd) as avg_windspeed_kmh from
            (select "bomStationId", Date(time) as date, "airTemp_c" as temp, cloud_oktas as clouds, gust_kmh as gust, 
            pressure_hpa as pressure, "rainSince9am_mm" as rainfall, "relHumidity_perc" as humidity, "windSpd_kmh" as windspd
            from "BomReadings" br 
            inner join "BomStations" bs on br."bomStationId" = bs.id 
            inner join "Suburbs" suburbs on suburbs.id = bs."suburbId"
            where date(time) between date(%s) and date(%s) 
            and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary)) as temps group by date order by date"""
        
        elif tGranularity == 'monthly':
            query = """select  year, month,  min(temp) as min_temp, max(temp) as max_temp, avg(temp) as avg_temp, avg(clouds) as avg_clouds_amnt, max(gust) as max_wind_gust_kmh, 
            avg(pressure) as avg_pressure, max(nullif(rainfall, 'NaN')) as total_rainfall, avg(humidity) as avg_humidity, avg(windspd) as avg_windspeed_kmh from
            (select "bomStationId", EXTRACT(year FROM time) AS year,  EXTRACT(month FROM time) AS month, "airTemp_c" as temp, cloud_oktas as clouds, gust_kmh as gust, 
            pressure_hpa as pressure, "rainSince9am_mm" as rainfall, "relHumidity_perc" as humidity, "windSpd_kmh" as windspd
            from "BomReadings" br 
            inner join "BomStations" bs on br."bomStationId" = bs.id 
            inner join "Suburbs" suburbs on suburbs.id = bs."suburbId"
            where date(time) between date(%s) and date(%s) 
            and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary)) as temps group by year, month order by year, month"""

        elif tGranularity == 'yearly':
            query = """select  year, min(temp) as min_temp, max(temp) as max_temp, avg(temp) as avg_temp, avg(clouds) as avg_clouds_amnt, max(gust) as max_wind_gust_kmh, 
            avg(pressure) as avg_pressure, max(nullif(rainfall, 'NaN')) as total_rainfall, avg(humidity) as avg_humidity, avg(windspd) as avg_windspeed_kmh from
            (select "bomStationId", EXTRACT(year FROM time) AS year,  "airTemp_c" as temp, cloud_oktas as clouds, gust_kmh as gust, 
            pressure_hpa as pressure, "rainSince9am_mm" as rainfall, "relHumidity_perc" as humidity, "windSpd_kmh" as windspd
            from "BomReadings" br 
            inner join "BomStations" bs on br."bomStationId" = bs.id 
            inner join "Suburbs" suburbs on suburbs.id = bs."suburbId"
            where date(time) between date(%s) and date(%s) 
            and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary)) as temps group by year order by year"""



        cursor.execute(query, tuple1)
        column_names = [desc[0] for desc in cursor.description]
        #print("Weather Cols: ", column_names)
        result = cursor.fetchall()
        df_weather = pd.DataFrame(result, columns = column_names)
        #print(df_weather)
        for col in column_names:
            if tGranularity == 'daily':
                if col != 'date':
                    df_ = df_weather[['date', col]]
                    dCols_df_lst.append([col, df_, tGranularity, dsName])
            elif tGranularity == 'monthly':
                if col not in ['year','month']:
                    df_ = df_weather[['year', 'month', col]]
                    dCols_df_lst.append([col, df_, tGranularity, dsName])

            elif tGranularity == 'yearly':
                if col != 'year':
                    df_ = df_weather[['year', col]]
                    dCols_df_lst.append([col, df_, tGranularity, dsName])


    
    elif dsName == 'trafficIncidents':
        #query = ''
        unique_cat_Q = "select distinct category from \"TrafficIncidentCategories\""
        cursor.execute(unique_cat_Q)
        result = cursor.fetchall()
        uniq_cat = []
        for i,row in enumerate(result):
            uniq_cat.append(row[0]) # getting unique categories

        for cat in uniq_cat:
            query = ''
            if str(cat) == 'None':
                continue
            #print(str(cat))
            tuple1 = [str(cat), sDate, eDate, spatialRange]

            if tGranularity == 'daily':
                query = sql.SQL("""select created::date as date, count(1) as {field} from "TrafficIncidentCategories" M 
                        inner join "TrafficIncidents" s on M.id = s."trafficIncidentCategoryId"
                        inner join "TrafficIncidentSuburbs" tis on s.id = tis."trafficIncidentId"
                        inner join "Suburbs" suburbs on suburbs.id = tis."suburbId"
                        where M.category=%s and date(created) between date(%s) and date(%s) 
                        and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by date order by date""").format(field=sql.Identifier(str(cat)))              

            elif tGranularity == 'monthly':
                query = sql.SQL("""select EXTRACT(year FROM created) AS year,  EXTRACT(month FROM created) AS month, count(1) as {field} from "TrafficIncidentCategories" M 
                        inner join "TrafficIncidents" s on M.id = s."trafficIncidentCategoryId"
                        inner join "TrafficIncidentSuburbs" tis on s.id = tis."trafficIncidentId"
                        inner join "Suburbs" suburbs on suburbs.id = tis."suburbId"
                        where M.category=%s and date(created) between date(%s) and date(%s) 
                        and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year, month order by year, month""").format(field=sql.Identifier(str(cat)))

            elif tGranularity == 'yearly':
                query = sql.SQL("""select EXTRACT(year FROM created) AS year, count(1) as {field} from "TrafficIncidentCategories" M 
                        inner join "TrafficIncidents" s on M.id = s."trafficIncidentCategoryId"
                        inner join "TrafficIncidentSuburbs" tis on s.id = tis."trafficIncidentId"
                        inner join "Suburbs" suburbs on suburbs.id = tis."suburbId"
                        where M.category=%s and date(created) between date(%s) and date(%s) 
                        and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year order by year""").format(field=sql.Identifier(str(cat)))

            cursor.execute(query, tuple1)
            column_names = [desc[0] for desc in cursor.description] # getting a list of column names
            #print(column_names)
            result = cursor.fetchall()
            df_trafficInc_item = pd.DataFrame(result, columns = column_names)
            print(df_trafficInc_item)
            dCols_df_lst.append([str(cat), df_trafficInc_item, tGranularity, dsName]) 


        # For aggregate
        query_agg = ''
        colName = ''
        tuple1 = [sDate, eDate, spatialRange]
        if tGranularity == 'daily':
            query_agg = """select created::date as date, count(1) as "totalTIncidentsDaily" from "TrafficIncidents" t
                            inner join "TrafficIncidentSuburbs" tis on t.id = tis."trafficIncidentId"
                            inner join "Suburbs" suburbs on suburbs.id = tis."suburbId"
                            where date(created) between date(%s) and date(%s) 
                            and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by date order by date"""             
            colName = 'totalTIncidentsDaily'
        
        elif tGranularity == 'monthly':
            query_agg = """select EXTRACT(year FROM created) AS year,  EXTRACT(month FROM created) AS month, count(1) as "totalTIncidentsMonthly" 
                            from "TrafficIncidents" t 
                            inner join "TrafficIncidentSuburbs" tis on t.id = tis."trafficIncidentId"
                            inner join "Suburbs" suburbs on suburbs.id = tis."suburbId"
                            where date(created) between date(%s) and date(%s) 
                            and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year, month order by year, month"""
            colName = 'totalTIncidentsMonthly'
        
        elif tGranularity == 'yearly':
            query_agg = """select EXTRACT(year FROM created) AS year, count(1) as "totalTIncidentsAnnually" 
                            from "TrafficIncidents" t
                            inner join "TrafficIncidentSuburbs" tis on t.id = tis."trafficIncidentId"
                            inner join "Suburbs" suburbs on suburbs.id = tis."suburbId"
                            where date(created) between date(%s) and date(%s) 
                            and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year order by year"""
            colName = 'totalTIncidentsAnnually'

        cursor.execute(query_agg, tuple1)
        column_names = [desc[0] for desc in cursor.description] # getting a list of column names
        #print(column_names)
        result = cursor.fetchall()
        df_trafficInc_total = pd.DataFrame(result, columns = column_names)
        #print(df_trafficInc_total)
        dCols_df_lst.append([colName, df_trafficInc_total, tGranularity, dsName]) 

        

    
    elif dsName == 'crimes':
        query = ''
        colName = ''
        tuple1 = [sDate, eDate, spatialRange]
        if tGranularity == 'monthly':
            query = """select year, month, sum(value) as "totalCrimesMonthly" from "CrimeIncidents" ci inner join "Suburbs" suburbs 
                    on ci."suburbId" = suburbs.id where year between EXTRACT(year FROM date(%s)) and EXTRACT(year FROM date(%s)) and 
                    ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year, month order by year, month"""            
            colName = 'totalCrimesMonthly'
        elif tGranularity == 'yearly':  
            query = """select year, sum(value) as "totalCrimesAnnually" from "CrimeIncidents" ci inner join "Suburbs" suburbs 
                    on ci."suburbId" = suburbs.id where year between EXTRACT(year FROM date(%s)) and EXTRACT(year FROM date(%s)) and 
                    ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year order by year""" 
            colName = 'totalCrimesAnnually'

        cursor.execute(query, tuple1)
        column_names = [desc[0] for desc in cursor.description] # getting a list of column names
        #print(column_names)
        result = cursor.fetchall()
        df_total_crimes = pd.DataFrame(result, columns = column_names)
        #print(df_total_crimes)
        dCols_df_lst.append([colName, df_total_crimes, tGranularity, dsName]) 


    
    elif dsName == 'trafficVolume':
        query = ''
        colName = ''
        tuple1 = [sDate, eDate, spatialRange]
        if tGranularity == 'daily':
            query = """select date, sum(value) as "trafficVolDaily" from "TrafficVolumeReadings" tr 
                        inner join "TrafficVolumeStations" tvs on tr."trafficVolumeStationId" = tvs.id
                        inner join "Suburbs" suburbs on suburbs.id = tvs."suburbId" 
                        where date(date) between date(%s) and date(%s) and 
                        ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by date order by date"""           
            colName = 'trafficVolDaily'
        elif tGranularity == 'monthly':
            query = """select EXTRACT(year FROM date) AS year, EXTRACT(month FROM date) AS month, sum(value) as "trafficVolMonthly" 
                    from "TrafficVolumeReadings" tr 
                    inner join "TrafficVolumeStations" tvs on tr."trafficVolumeStationId" = tvs.id 
                    inner join "Suburbs" suburbs on suburbs.id = tvs."suburbId"
                    where date(date) between date(%s) and date(%s) and 
                    ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year, month order by year, month"""           
            colName = 'trafficVolMonthly'
        elif tGranularity == 'yearly':  
            query = """select EXTRACT(year FROM date) AS year, sum(value) as "trafficVolAnnually" from "TrafficVolumeReadings" tr 
                    inner join "TrafficVolumeStations" tvs on tr."trafficVolumeStationId" = tvs.id
                    inner join "Suburbs" suburbs on suburbs.id = tvs."suburbId"
                    where date(date) between date(%s) and date(%s) and 
                    ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year order by year""" 
            colName = 'trafficVolAnnually'

        cursor.execute(query, tuple1)
        column_names = [desc[0] for desc in cursor.description] # getting a list of column names
        #print(column_names)
        result = cursor.fetchall()
        df_total_tVolume = pd.DataFrame(result, columns = column_names)
        #print(df_total_tVolume)
        dCols_df_lst.append([colName, df_total_tVolume, tGranularity, dsName])

    
    elif dsName == 'emissions':
        query = ''      
        types_Q = "select distinct name from \"CosGhgCategories\""
        cursor.execute(types_Q)
        column_names = [desc[0] for desc in cursor.description] # getting a list of column names
        #print(column_names)
        result = cursor.fetchall()
        lst_emissions_types = []
        for i,row in enumerate(result):
            lst_emissions_types.append(row[0]) # getting all emissions types

        for cat in lst_emissions_types:
            if str(cat) == 'None':
                continue
            tuple1 = [str(cat), sDate, eDate, spatialRange]

            if tGranularity == 'yearly':           
                query = sql.SQL("""select year, sum(reading) as {field}
                         from "CosGhgEmissions" R
                         inner join "CosGhgCategories" C on R."categoryId" = C.id
                         inner join "CosGhgEmissionSuburbs" cges on R.id = cges."cosGhgEmissionId"
                         inner join "Suburbs" suburbs on suburbs.id = cges."suburbId"
                         where C.name=%s
                         and year between EXTRACT(year FROM date(%s)) and EXTRACT(year FROM date(%s))
                         and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary)
                         group by year
                         order by year""").format(field=sql.Identifier(str(cat)))
            
            cursor.execute(query, tuple1)
            column_names = [desc[0] for desc in cursor.description] # getting a list of column names
            #print(column_names)
            result = cursor.fetchall()
            df_cat_emissions = pd.DataFrame(result, columns = column_names)
            #print(df_cat_emissions)
            dCols_df_lst.append([str(cat), df_cat_emissions, tGranularity, dsName])

        if tGranularity == 'yearly':
            # Now annual aggregate
            tuple1 = [sDate, eDate, spatialRange]
            query_year = """select year, sum(reading) as "totalEmissionsAnnually" from "CosGhgEmissions" R
                         inner join "CosGhgCategories" C on R."categoryId" = C.id
                         inner join "CosGhgEmissionSuburbs" cges on R.id = cges."cosGhgEmissionId"
                         inner join "Suburbs" suburbs on suburbs.id = cges."suburbId"                     
                         where year between EXTRACT(year FROM date(%s)) and EXTRACT(year FROM date(%s))
                         and ST_Intersects(ST_SetSrid(ST_GeometryFromText(%s),4326), boundary) group by year order by year"""
            cursor.execute(query_year, tuple1)
            column_names = [desc[0] for desc in cursor.description] # getting a list of column names
            #print(column_names)
            result = cursor.fetchall()
            df_total_emissions = pd.DataFrame(result, columns = column_names)
            #print(df_total_emissions)
            dCols_df_lst.append(["totalEmissionsAnnually", df_total_emissions, tGranularity, dsName])
            
    return dCols_df_lst


def comp_Correlation(column1, column2, corr_Type, df_bucks_lst):
    # This function computes the requested type correlation
    # Returns average correlation and P-Value
    #df_bucks_lst.append((column, df_col_buck, numBins, len(uniq_val), len(df_num)))

    corr_1 =0
    pvalue_1 = 0       
    corr_2 = 0
    pvalue_2 = 0
    col1_bucketed_df = pd.DataFrame()
    col2_bucketed_df = pd.DataFrame()
    #print("In comp_Correlation(): ", column1, column2)
    #print("Indeces: ", columns_name.get_loc(column1), columns_name.get_loc(column2))
    #print("Col names from the bucked list: ", df_bucks_lst[columns_name.get_loc(column1)][0], df_bucks_lst[columns_name.get_loc(column2)][0])

    col1_bucketed_df = df_bucks_lst[0][1] # df_buck_lst has only two columns now
    actualNumRow1 = df_bucks_lst[0][4]
    uniqVals1 = df_bucks_lst[0][3]
    #print("col1_buck_df: \n", col1_bucketed_df)
    col2_bucketed_df = df_bucks_lst[1][1]
    actualNumRow2 = df_bucks_lst[1][4]
    uniqVals2 = df_bucks_lst[1][3]
    #print("col2_buck_df: \n", col2_bucketed_df)

   
    if len(col1_bucketed_df) < 10 or len(col2_bucketed_df) < 10:        

        return 0, 0, len(col1_bucketed_df), len(col2_bucketed_df), actualNumRow1, actualNumRow2, uniqVals1, uniqVals2

    else:
        if corr_Type == 'Pearson':
            corr_1, pvalue_1 = pearsonr(col1_bucketed_df[column1], col1_bucketed_df[column2])        
            corr_2, pvalue_2 = pearsonr(col2_bucketed_df[column2], col2_bucketed_df[column1])                 

        elif corr_Type == 'Spearman':
            corr_1, pvalue_1 = spearmanr(col1_bucketed_df[column1], col1_bucketed_df[column2])        
            corr_2, pvalue_2 = spearmanr(col2_bucketed_df[column2], col2_bucketed_df[column1])

        elif corr_Type == 'Kendall':
            corr_1, pvalue_1 = kendalltau(col1_bucketed_df[column1], col1_bucketed_df[column2])
            corr_2, pvalue_2 = kendalltau(col2_bucketed_df[column2], col2_bucketed_df[column1])


        Avg_Corr = (corr_1 + corr_2)/2
        Avg_Pvalue = (pvalue_1 + pvalue_2)/2

        return Avg_Corr, Avg_Pvalue, len(col1_bucketed_df), len(col2_bucketed_df), actualNumRow1, actualNumRow2, uniqVals1, uniqVals2

def col_bucket_df(df_num, num_Buckets): #
    #print("Number of Buckets: ", num_Buckets)
    #print(df_num)
    #print(df_num.dtypes)
    
    df_bucks_lst = []
    #print("IN Bucketing....", df_num.head().to_string(), file=sys.stderr)
    for column in df_num:
        #print(column, len(df_num[column]), file=sys.stderr)
        df_col_buck = pd.DataFrame()
        df_sorted = df_num.sort_values(column)
        #print(df_sorted.dtypes)

        uniq_val = df_sorted[column].unique()
        #print("Unique vals: ", uniq_val)
        if len(uniq_val) < 10:
            df_bucks_lst.append((column, pd.DataFrame(), len(uniq_val), len(uniq_val), len(df_num))) # returning empty dataframe coz we dont want to compute correlation in a such case
        else:
            if len(uniq_val) >= num_Buckets:
                chunk_size = len(uniq_val)/num_Buckets
                #print("chunk size: ", chunk_size)
                boundaries_lst = []
                #boundaries_lst.append(uniq_val[0]) # Appending first value as a first boundary
                for i in range(0, len(uniq_val), int(chunk_size)):
                    #print ("i: ", i)
                    boundaries_lst.append(uniq_val[i])

                if boundaries_lst[-1] < uniq_val[-1]: # if less than number of chunk size remaining values left, take the last unique value and add as one more boundary in the boundary list
                    boundaries_lst.append(uniq_val[-1])
                #boundaries_lst.append(uniq_val[-1])
                #print("boundary list: ", boundaries_lst)
                df_sorted['Col_Cut'] = pd.cut(df_sorted[column].astype('float'), bins = boundaries_lst)
            #elif num_Buckets > len(df_sorted[column]):
                #df_sorted['Col_Cut'] = pd.cut(df_sorted[column], bins = len(df_sorted[column]))
            else:
                #print("in else: ", df_sorted[column])
                df_sorted['Col_Cut'] = pd.cut(df_sorted[column].astype('float'), bins = len(uniq_val)) 
                # .astype('float') was used to address the error --> unsupported operand type(s) for +: 'decimal.Decimal' and 'float' --> 
                # https://stackoverflow.com/questions/50966174/typeerror-unsupported-operand-types-for-decimal-decimal-and-float

           
            #print(pd.qcut(df_sorted[column], q = int(num_Buckets), duplicates="drop").value_counts())
            gb = df_sorted.groupby('Col_Cut', as_index=False, observed=True)    # last two parameters to avoid emtpy groups
            numBins = len(gb) # same as len(df_col_buck)
            for x in gb.groups: 
                #print(len(gb.get_group(x)))    
                if len(gb.get_group(x)) > bucket_size2Bignored:
                    sub_series = gb.get_group(x).mean() # gb.get_group(x) returns each group as a dataframe. Mean() returns mean for each column               
                    df_sub = pd.DataFrame(sub_series).transpose()              
                    df_col_buck = pd.concat([df_col_buck, df_sub], axis=0) # adding a bucket row of means

            #print("numRowsInDF: ", len(df_col_buck))
            df_bucks_lst.append((column, df_col_buck, numBins, len(uniq_val), len(df_num)))

    return df_bucks_lst


def print_Output(scoreList, Type, dSet1, dSet2, dSetType):

    # scoreList = [pair[0], pair[1], Avg_corr, Avg_Pvalue, Significane, Score, actualNumRow1, actualNumRow2, uniqVals1, uniqVals2, num_Buckets]
    n = len(scoreList)
    #penalty_str = 'Similar penalty: %.2f, Pollution_Weather penalty: %.2f, Pollution_Traffic penalty: %.2f, Weather_Traffic penalty: %.2f' %(sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen)
    #heading = 'COLUMN1, COLUMN2, CORRELATION, SCORE, TYPE'
    strDatasets = str(dSet1) + '-' + str(dSet2)
    #print(penalty_str + '      -------      ' + corr_Type)
    #print('COLUMNS'.center(65), 'CORRELATION'.center(20) , 'SCORE'.center(20), 'PENALTY'.center(20), 'FINAL SCORE'.center(20))
    #for k in range(n):
        #print(scoreList[k][0].center(65), str(scoreList[k][1]).center(20), str(scoreList[k][4]).center(20), str(scoreList[k][2]).center(20), str(scoreList[k][3]).ljust(25))
    
    with open('Pairwise_Scores_simpleCorr.csv', 'a') as f:
        #f.write("num Buckets: " + str(num_Buckets) + '\n')
        #f.write(strDatasets+'\n')
        #f.write(heading+'\n')
        for k in range(n):

            line = str(scoreList[k][0]).replace(',', '_')+ ',' + str(scoreList[k][1]).replace(',', '_') + ',' + str(scoreList[k][2]) + ',' + str(scoreList[k][3]) + ',' + str(scoreList[k][4]) + ',' + str(scoreList[k][5]) + ',' + str(scoreList[k][6]) + ',' + str(scoreList[k][7]) + ',' + str(scoreList[k][8]) + ',' + str(scoreList[k][9]) + ',' + str(scoreList[k][10]) + ',' + str(Type) + ',' +str(strDatasets) + ',' + str(dSetType)
            print(line)
            f.write(line+'\n')
        #f.write('\n')


def apply_PenaltyNSorting(Score_DF, penalty):
    #print(sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen)

    for ind, row in Score_DF.iterrows():
        pairTuple = (row['COLUMN1'], row['COLUMN2'])
        #print(pairTuple, type(pairTuple))        
        if row['comparison_Type'] == 1:
            Score_DF.at[ind, 'Score'] = row['Score'] - penalty

    Score_DF.reset_index(drop=True, inplace=True)
    Score_DF.sort_values(by=['Score'], ascending=False, inplace=True) # sorting on Score

    return Score_DF




## ********************************************************* ##
############ END Simple Correlation ###########################
## ********************************************************* ##


## //////////////////////////////////////////////////////////##
## //////////////////////////////////////////////////////////##
## //////////////////////////////////////////////////////////##


## ********************************************************* ##
############ START SPATIAL AUTO-Correlation ###################
## ********************************************************* ##

def Fetch_N_dFrame_Spatial_Corr(dataset_type, d_column):
    tuple1 = ()
    np.set_printoptions(threshold=sys.maxsize)
    conn = psycopg2.connect(database="root", user='root', password='root', host='127.0.0.1', port= '5433')
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    query1 = ''

    if dataset_type == 'crimes':
        query1 = sql.SQL("""select readings.{col}, readings."suburbId", suburbs.name as "Suburb", ST_AsGeoJSON(suburbs.boundary) as boundary from (select sum(value) as {col}, 
            \"suburbId\" from \"CrimeIncidents\" where year=%s group by "suburbId") readings left join \"Suburbs\" suburbs on readings.\"suburbId\" = suburbs.id""").format(
            field=sql.Identifier(dataset_type), col=sql.Identifier(d_column))
        #query1 = "select readings.crimes, readings.\"suburbId\", suburbs.name as \"Suburb\", suburbs.\"geoData\" from (select sum(value) as crimes, \"suburbId\" from \"CrimeIncidents\" where year=\'1995\' group by \"suburbId\") readings left join \"Suburbs\" suburbs on readings.\"suburbId\" = suburbs.id"
        tuple1 = ([d_column])
    
    elif dataset_type == 'emissions':
        query1 = sql.SQL("""select aggregates.{col} , name as "Suburb", ST_AsGeoJSON(suburbs.boundary) as boundary from (select sum(reading) as {col}, cges."suburbId" from "CosGhgEmissions" readings
                inner join "CosGhgEmissionSuburbs" cges on readings.id = cges."cosGhgEmissionId" where year=%s group by cges."suburbId"
                ) aggregates left join "Suburbs" suburbs on aggregates."suburbId" = suburbs.id""").format(col=sql.Identifier(d_column))
        tuple1 = ([d_column])

        #query1 = sql.SQL("""select readings.{col}, readings."suburbId", suburbs.name as "Suburb", ST_AsGeoJSON(suburbs.boundary) as boundary from 
        #(select sum(reading) as {col}, "suburbId" from "CosGhgEmissions" where year={col} group by "suburbId") readings 
        #left join "Suburbs" suburbs on readings."suburbId" = suburbs.id""").format(field=sql.Identifier(dataset_type), col=sql.Identifier(d_column))
    
    elif dataset_type == 'pollution':

        query1 = sql.SQL("""select readings.{col}, readings."airQualitySiteId", sites.position as "point_geom", suburbs.name as "Suburb", ST_AsGeoJSON(suburbs.boundary) as boundary from 
        (select sum(value) as {col}, "airQualitySiteId" from "AirQualityReadings" where type=%s group by "airQualitySiteId") readings 
        left join "AirQualitySites" sites on readings."airQualitySiteId" = sites.id left join "Suburbs" suburbs on sites."suburbId" = suburbs.id""").format(
        field=sql.Identifier(dataset_type), col=sql.Identifier(d_column))
        tuple1 = ([d_column])


    # put value in the braket if this error occurs: TypeError: 'int' object does not support indexing
    
    #col = 'suburbId'
    #cursor.execute(sql.SQL(query1).format(sql.Identifier('suburbId')), tuple1) # works for dynamic sql query with one field or table name.
    cursor.execute(query1, tuple1)
    column_names = [desc[0] for desc in cursor.description] # getting a list of column names
    result = cursor.fetchall()
    df_data = pd.DataFrame(result, columns = column_names) # creating dataframe from the database table. Bydefault, results will not include column names, so have to fetch separately in a list
    df_data.drop(df_data[df_data['Suburb'] == 'SYDNEY'].index, inplace = True) # deleting sydney coz it has very big overlaping boundary with other suburbs


    df_data['geometry'] = np.nan # creating empty column to store multipoligones later
    print(df_data.columns)
    #print(df_data.head().to_string())


    df_data_short = dFrame_Processing_NEW(df_data, dataset_type, d_column)
    gf_data = Convert_2_geoDF(df_data_short)
    return gf_data
    #plotting(gf_data, dataset_type, d_column)
    #Spatial_Correlation(gf_data, dataset_type, d_column)



def dFrame_Processing_NEW(df_data, dataset_type, d_column):
    
    for ind, row in df_data.iterrows():
        geometry = row['boundary']
        #if len(geometry) != 0:
        if geometry is not None:
            #print(type(json.loads(geometry)))
            coordinates = json.loads(geometry)['coordinates'][0]
            polygon_geom = Polygon(coordinates)
            #print(polygon_geom)
            #mult_poly = shapely.geometry.MultiPolygon([polygon_geom])
            df_data.at[ind, 'geometry'] = shapely.geometry.MultiPolygon([polygon_geom])

            #print(mult_poly)

        else: # if the entry is empty
            df_data.drop(ind, inplace=True)

    
    df_data.reset_index(drop=True, inplace=True)
    #print("at index 0: ",df_data.at[0, 'geometry'])
    #df_data[["Suburb", "geometry"]].head().to_csv("merge_tables_crimes.csv")
    print(df_data[["Suburb", "geometry"]])

    return df_data[['Suburb', 'geometry', d_column]]


def Convert_2_geoDF(df):

    geo_DF = gpd.GeoDataFrame(df, geometry='geometry', crs='EPSG:4326')
    geo_DF = geo_DF.dropna(how='any',axis=0)
    #print(suburb_final)

    return geo_DF
    


def Spatial_Corr_global(suburb_final, dataset_type, d_column):
    
    #Spatial AutoCorrelation

    w =  lps.weights.Queen.from_dataframe(suburb_final)
    #w =  lps.weights.Rook.from_dataframe(suburb_final)
    #w =  lps.weights.KNN.from_dataframe(suburb_final, k=4)
    #w = lps.weights.distance.Kernel.from_dataframe(suburb_final) # https://geographicdata.science/book/notebooks/04_spatial_weights.html
    #w = lps.weights.distance.DistanceBand.from_dataframe(suburb_final, 1.5, binary=True) # NOT GOOD!. from the above linke. For example, let us calculate the DistanceBand weights that use inverse distance weights up to a certain threshold and then truncate the weights to zero for everyone else
    #print("Neighbourhood of first suburb: ", w.neighbors[0])
    neb = w.neighbors[0] # returns a list of neighbours row indices
    #print('type of neighbors array: ', type(neb))
    #print(suburb_final['Suburb'][[0]]) # suburb name of first suburb
    #print(suburb_final['Suburb'][neb])
    #print('type of W: ', type(w))
    #print(w)
    #w.transform = 'r' # if W is row-standardized, the result amounts to the average value of the variable in the neighborhood of each observation.
    #print(w)
    suburb_final['w_lag_Crimes'] = lps.weights.lag_spatial(w, suburb_final[d_column])
    y = suburb_final[d_column]
    moran = esda.Moran(y, w) # can take num of permutations
    print(moran.I, moran.p_sim)


    # X-axis = z-standardised attribute values
    # Y-axis = z-standardised lagged attribute values
    ## https://stackoverflow.com/questions/36372120/creating-univariate-moran-scatterplot-in-pysal

    fig, ax = moran_scatterplot(moran, zstandard=False) # Only scatterplot
    ax.set_ylabel('Spatial Lag of' + dataset_type)
    ax.set_xlabel(d_column)
    plt.show()

    #sns.scatterplot(x="col_name_1", y="col_name_2", data=df)
    sns.scatterplot(x=d_column, y='w_lag_Crimes', data=suburb_final)
    plt.show()
    

    #return str(suburb_final['w_lag_Crimes'])
    return str([moran.I, moran.p_sim])


    
def Spatial_Corr_local(suburb_final, dataset_type, d_column):

    w =  lps.weights.Queen.from_dataframe(suburb_final)
    suburb_final['w_lag_Crimes'] = lps.weights.lag_spatial(w, suburb_final[d_column])
    y = suburb_final[d_column]

    #https://pysal.org/esda/generated/esda.Moran_Local.html --> See for Moran's local

    m_local = Moran_Local(y, w)

    P_VALUE = 0.05
    fig, ax = plt.subplots(figsize=(10,10))
    moran_scatterplot(m_local, p=P_VALUE, ax=ax)
    ax.set_xlabel(d_column)
    ax.set_ylabel('Spatial Lag of' + d_column)
    plt.text(1.35, 0.5, 'HH', fontsize=25)
    plt.text(1.65, -0.8, 'HL', fontsize=25)
    plt.text(-1.5, 0.6, 'LH', fontsize=25)
    plt.text(-1.3, -0.8, 'LL', fontsize=25)
    plt.show()



    # https://stackoverflow.com/questions/56309800/how-to-define-colors-of-lisa-cluster-manually -- changing map colors
    # https://pysal.org/esda/notebooks/spatialautocorrelation.html
    # https://gist.github.com/darribas/657e0568df7a63362762
    fig, ax = plt.subplots(figsize=(12,10))
    lisa_cluster(m_local, suburb_final, p=P_VALUE, ax=ax)
    suburb_final.boundary.plot(ax=ax)
    plt.title('NSW Suburbs aggregate' + d_column + ' Spatial Lag Choropleth Map')
    plt.tight_layout()
    plt.show()
    suburb_final['local_moran'] = m_local.Is
    suburb_final['quadrant'] = m_local.q

    '''
    print("m_LOCAL: ", m_local) # moran local object
    #print(m_local.q) # Returns an array. values indicate quandrant location 0: non-sig, 1: HH, 2: LH, 3: LL, 4: HL. I can match the corresponding values with y to get suburb names. First value will correspond to 1st suburb/row in the data dataframe
    #print(m_local.Is) # Local Moran's I values for each suburb with its neighbours. A negative value for I indicates that a feature has neighboring features with dissimilar values; this feature is an outlier. 
    suburb_final['quadrant'] = m_local.q # Storing each suburb quadrant they belong to. 1=HH, 2=LH, 3=LL, 4=HL --> http://darribas.org/gds19/content/labs/lab_06.html
    suburb_final['local_moran'] = m_local.Is
    suburb_final['p_Sim'] = m_local.p_sim
    suburb_final['EI_Sim'] = m_local.EI_sim
    print(suburb_final.columns)
    suburb_final.sort_values(by=['w_lag_Crimes'], ascending=False, inplace=True) # sorting affected the plot
    print(suburb_final[['Suburb', 'Jan 1995', 'w_lag_Crimes', 'quadrant', 'local_moran', 'p_Sim']].to_string())
    '''
    dict = suburb_final[['Suburb','quadrant','local_moran']].to_dict('dict')
    return jsonify(dict)



def plotting(suburb_final, dataset_type, d_column):

    sydney_coordinate =  [-33.865143, 151.209900]
    NSW_stats = folium.Map(location=sydney_coordinate, zoom_start=10)
    folium.TileLayer('CartoDB positron').add_to(NSW_stats)
    mapTitle = 'NSW Suburbs aggregate' + d_column
    title_html = '''
                 <h3 align="center"><b>{}</b></h3>
                 '''.format(mapTitle)   
    NSW_stats.get_root().html.add_child(folium.Element(title_html))
    choropleth = folium.Choropleth(geo_data=suburb_final,
        data=suburb_final,
        bins=7,
        columns=['Suburb', d_column],
        key_on='feature.properties.Suburb',
        line_color='black',
        line_width=1,
        fill_color= 'YlOrRd', # ‘BuGn’, ‘BuPu’, ‘GnBu’, ‘OrRd’, ‘PuBu’, ‘PuBuGn’, ‘PuRd’, ‘RdPu’, ‘YlGn’, ‘YlGnBu’, ‘YlOrBr’, and ‘YlOrRd’.
        fill_opacity=0.5, 
        line_opacity=0.5,
        legend_name=d_column
    ).add_to(NSW_stats)
    choropleth.geojson.add_child(
        folium.features.GeoJsonTooltip(['Suburb', d_column], labels=True, localize=True))
    NSW_stats
    NSW_stats.save('NSW_stats_Map.html')

    # Plot suburbs crimes sum 
    fig, ax = plt.subplots(figsize=(12,10))
    suburb_final.plot(column=d_column, scheme='Quantiles', k=10, cmap='GnBu', legend=True, ax=ax); # quintiles
    suburb_final.boundary.plot(ax=ax)
    plt.title('Sydney Suburbs aggregate ' + d_column)
    plt.tight_layout()
    plt.show()


def max_level(lst):
    return isinstance(lst, list) and max(map(max_level, lst or [0])) + 1 # [0] for empty list



## ********************************************************* ##
############ END SPATIAL AUTO-Correlation #####################
## ********************************************************* ##


if __name__ == "__main__":

    app.run(debug = True, host = "0.0.0.0", port = 3200)

    #Insights_Score('2021-No AprilOct-Weather-TrafficHazards-Greenhouse.csv')
    #Fetch_N_dFrame()

    #fetch_traffic()

    #Fetch_N_dFrame_Simple_Corr('52,23')
    #apply_PenaltyNSorting("Pairwise_Scores_simpleCorr.csv", 0.4)
    #penaltyLst = [0.2, 0.4, 0.6, 0.8]
    #for penalty in penaltyLst:



