## branch_db_sel_region

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
import os
import re # for string formatting

import math
import sys
import operator
import psycopg2
from psycopg2 import sql ### https://www.psycopg.org/psycopg3/docs/api/sql.html#module-psycopg.sql
from flask import Flask, request
from flask import jsonify

import warnings
warnings.filterwarnings('ignore', '.*is deprecated.*', )
warnings.filterwarnings('ignore', '.*float.*', )
warnings.filterwarnings('ignore', '.*interpolation.*', )
warnings.filterwarnings('ignore', '.*Degrees.*', )
warnings.filterwarnings('ignore', '.*divide.*', )



Insight = ''
menu_Column1 = ''
menu_Column2 = 'Select any Column'
chart = ''
out_param = 1.5 #default

sorted_global_Corr_list = []
out_corr_list = []

single_corr = [] # to store single correlation values

columns_lst = [],
all_Cols_Pairs = []

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

df_bucks_lst = []
Dataset_Col_Associ_lst = []


init_figure = Figure()


app = Flask(__name__)


######### ************ Simple Correlation ************** ##############
@app.route('/simple_corr/')
def simple_corr():
    region = input_params_simple()
    df_data = Fetch_N_dFrame_Simple_Corr(region)
    results = Insights_Score(df_data)
    print("Results: ",results[0:10], file=sys.stderr)
    return str(results[0:10])

def input_params_simple():
    region = request.args.get('region')
    #d_column = request.args.get('col')
    return region

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

def Fetch_N_dFrame_Simple_Corr(region):

    global Dataset_Col_Associ_lst
    np.set_printoptions(threshold=sys.maxsize)
    conn = psycopg2.connect(database="root", user='root', password='root', host='127.0.0.1', port= '5433')
    #Creating a cursor object using the cursor() method
    cursor = conn.cursor()


    ##### ----- Pollution ---------- #########

    ## ********** st_geomfromtext()

    print("##### ----- Pollution ---------- #########")

    #dist_pol_q = "select distinct type from \"AirQualityReadings\""
    #cursor.execute(dist_pol_q)

    lst_poll = ['CO', 'SO2', 'NO2', 'OZONE']
    df_pollution = pd.DataFrame()
    for item in lst_poll:
        query = sql.SQL("""select date, sum(value) as {field} from 
            (select value, Date(date) as date from "AirQualityReadings" ar inner join "AirQualitySites" bs
            on ar."airQualitySiteId" = bs.id
            where ST_Contains(ST_SetSRID(ST_GeometryFromText('POLYGON(( 150.75389134450774 -33.59735137171584, 151.34643938711528 -33.766199181893704, 
            151.30784907341607 -34.06681311892785, 150.63189615926498 -34.00594964988948, 150.75389134450774 -33.59735137171584 ))'), 4326),
            position) and type=%s
            ) as Temps
            group by date
            """).format(field=sql.Identifier(item))
        #query = sql.SQL("select created::date as date, count(1) as {field} from \"TrafficIncidentCategories\" M inner join \"TrafficIncidents\" s on M.id = s.\"trafficIncidentCategoryId\" where M.category=%s group by date, M.category order by date").format(field=sql.Identifier(str(cat)))
        tuple1 = [item]
        cursor.execute(query, tuple1)
        column_names = [desc[0] for desc in cursor.description] # getting a list of column names
        #print(column_names)
        result = cursor.fetchall()
        if len(result) > 0:
            df_pol_item = pd.DataFrame(result, columns = column_names)
            #print(df_pol_item.head())
            if df_pollution.empty:
                #print('DataFrame is empty!')
                df_pollution = df_pol_item
            else:
                df_pollution = pd.merge(df_pollution, df_pol_item, on='date', how='outer')


    df_pollution = df_pollution.fillna(0)
    #print(df_pollution.head(200).to_string())


    for col in df_pollution:
        if col != 'date':
            Dataset_Col_Associ_lst.append((col, 1))

    print("After pollution: ", Dataset_Col_Associ_lst)



    ## -------------- Weather ------------------ ##

    query2 = """select  date,  min(temp) as min_temp, max(temp) as max_temp, avg(temp) as avg_temp, avg(clouds) as avg_clouds_amnt, avg(gust) as avg_wind_gust_kmh, 
    avg(pressure) as avg_pressure, sum(rainfall) as total_rainfall, avg(humidity) as avg_humidity, avg(windspd) as avg_windspeed_kmh from
    (
    select "bomStationId", Date(time) as date, "airTemp_c" as temp, cloud_oktas as clouds, gust_kmh as gust, 
    pressure_hpa as pressure, "rainSince9am_mm" as rainfall, "relHumidity_perc" as humidity, "windSpd_kmh" as windspd
    from "BomReadings" br
    inner join "BomStations" bs
    on br."bomStationId" = bs.id
    where ST_Contains(ST_SetSRID(ST_GeometryFromText('POLYGON(( 150.75389134450774 -33.59735137171584, 151.34643938711528 -33.766199181893704, 151.30784907341607 -34.06681311892785, 
    150.63189615926498 -34.00594964988948, 150.75389134450774 -33.59735137171584 ))'), 4326),
    position)
    ) as temps
    group by date
    order by date"""

    # ST_astext(position)

    cursor.execute(query2)

    column_names = [desc[0] for desc in cursor.description] # getting a list of column names
    #print(column_names)
    result = cursor.fetchall()
    #print(result)
    df_weather = pd.DataFrame(result, columns = column_names)
    #print(df_weather.columns)
    #print(df_weather.head(100).to_string())

    df_weather = df_weather.fillna(0)
    #print(df_weather.head(200).to_string())


    for col in df_weather:
        if col != 'date':
            Dataset_Col_Associ_lst.append((col, 2))

    print("After weather: ", Dataset_Col_Associ_lst)


    df_data = pd.merge(df_pollution, df_weather, on='date', how='outer')



    ##### ------ Traffic ----- ######

    unique_cat_Q = "select distinct category from \"TrafficIncidentCategories\""
    cursor.execute(unique_cat_Q)
    column_names = [desc[0] for desc in cursor.description] # getting a list of column names
    #print(column_names)
    result = cursor.fetchall()
    uniq_cat = []
    for i,row in enumerate(result):
        uniq_cat.append(row[0]) # getting unique categories
    

    df_traffic = pd.DataFrame()
    for cat in uniq_cat:
        if str(cat) == 'None':
            continue
        #print(str(cat))
        #query = sql.SQL("select created::date as createddate, M.category, count(1) as {field} from \"TrafficIncidentCategories\" M inner join \"TrafficIncidents\" s on M.id = s.\"trafficIncidentCategoryId\" where M.category={field} group by createddate, M.category order by createddate").format(field=sql.Identifier(str(cat)))
        
        query = sql.SQL("""select created::date as date, count(1) as {field} from "TrafficIncidentCategories" M 
        inner join "TrafficIncidents" s on M.id = s."trafficIncidentCategoryId" where 
        ST_Contains(ST_SetSRID(ST_GeometryFromText('POLYGON(( 
        150.75389134450774 -33.59735137171584, 151.34643938711528 -33.766199181893704, 151.30784907341607 -34.06681311892785, 
        150.63189615926498 -34.00594964988948, 150.75389134450774 -33.59735137171584 ))'), 4326),
        s.position) and M.category=%s group by date order by date""").format(field=sql.Identifier(str(cat)))


        #query = sql.SQL("""select created::date as date, count(1) as {field} from \"TrafficIncidentCategories\" M inner join \"TrafficIncidents\" s on M.id = s.\"trafficIncidentCategoryId\" where M.category=%s group by date, M.category order by date""").format(field=sql.Identifier(str(cat)))
        tuple1 = [str(cat)]
        cursor.execute(query, tuple1)
        column_names = [desc[0] for desc in cursor.description] # getting a list of column names
        #print(column_names)
        result = cursor.fetchall()
        df_category = pd.DataFrame(result, columns = column_names)
        #print(df_category.head())
        if df_traffic.empty:
            #print('DataFrame is empty!')
            df_traffic = df_category
        else:
            df_traffic = pd.merge(df_traffic, df_category, on='date', how='outer')

    df_traffic = df_traffic.fillna(0)
    #print(df_traffic.head(200).to_string())    

    for col in df_traffic:
        if col != 'date':
            Dataset_Col_Associ_lst.append((col, 3))

    print("After traffic: ", Dataset_Col_Associ_lst)

    
    #region_Coord = [[-33.79324442810704, 151.00998539335995], [-33.81436283421616, 151.20906838968926], [-33.95282295807322, 150.98774739908913], [-33.94535624482028, 151.20218520098638]]
    #polygon_geom = Polygon(region_Coord)
    #print(polygon_geom)
    #print(shapely.wkt.loads(str(polygon_geom)))
    #mut_poly = shapely.geometry.MultiPolygon([polygon_geom]) #converting to multipolygon. Takes iterable object, so converting to list
    #crs = 'epsg:4326'
    #gf_region = gpd.GeoDataFrame(index=[0], crs=crs, geometry=[mut_poly])
    #print(gf_region)

    
    
    #Extracting specific part from timestamp. ## ***** https://modern-sql.com/feature/extract

    ### SELECT * FROM "BomReadings" where EXTRACT(HOUR FROM time) = 9 and EXTRACT(MINUTE FROM time) = 30
    
    
    df_data = pd.merge(df_data, df_traffic, on='date', how='outer')

    df_data = df_data.drop(['date'], axis = 1)
    df_data = df_data.fillna(0)
    print(df_data.columns)
    print(len(df_data.columns), len(Dataset_Col_Associ_lst))
    df_data.to_csv("Merged_DFs.csv")
    

    return df_data


    ########  ------------  Traffic Incidents ---------------  ###########

    '''
    select   created::date as createddate, M.category, count(1) as BreakDown from "TrafficIncidentCategories" M
    inner join "TrafficIncidents" s on M.id = s."trafficIncidentCategoryId"
    where M.category='BREAKDOWN'
    group by createddate,M.category
    order by createddate, M.category
    '''



def Insights_Score(df_data):

    global Dataset_Col_Associ_lst
    '''
    if os.path.exists("penalty-score.csv"):
        os.remove("penalty-score.csv")
        print("The file has been deleted successfully")
    else:
        print("The file does not exist!")
    '''
    
    global df_Mean_Buckets, df_bucks_lst, all_Cols_Pairs, columns_lst

   
    #df = pd.read_csv(file_name,encoding= 'unicode_escape')

    #df_data = df.select_dtypes(include=np.number) # to find outliers in numerical columns. will return numeric columns only
    df_data = df_data.fillna(0)
    

    
    '''
    for col in df_data: # for this, we need to add a row in the combined dataset file where each colum has a number representing its corresponding dataset. For example, 1 for pollution, 2 for weather and so on
        Dataset_Col_Associ_lst.append((col, df_data.loc[0, col])) # first row value for each column
    print(len(Dataset_Col_Associ_lst), Dataset_Col_Associ_lst)
    df_data.drop(0, inplace = True) # dropping the 1st row after extracting the association numbers
    '''
    

    all_num_column = list(df_data) # getting column names for dropdown options
    #print(df_data["HEAVY TRAFFIC"].to_string())

    #df_selected_cols = df_data[["Rainfall (mm)", "Speed of maximum wind gust (km/h)", "CRASH", "HAZARD", "HEAVY TRAFFIC"]]
    #df_selected_cols = df_data[['Rainfall (mm)', 'Speed of maximum wind gust (km/h)', 'CRASH', 'HAZARD', 'HEAVY TRAFFIC', 'NO2', '9am Temperature (Ã\x82Â°C)', '9am relative humidity (%)', '9am cloud amount (oktas)', '9am MSL pressure (hPa)', '3pm Temperature (Ã\x82Â°C)', '3pm relative humidity (%)', '3pm cloud amount (oktas)', '3pm MSL pressure (hPa)']]

    df_selected_cols = df_data.copy(deep = True)
    
    #print(df_selected_cols.head().to_string())
    #print(len(df_selected_cols.columns))

    columns_lst = list(df_selected_cols) # getting column names as a list

   

    #print(len(columns_lst), columns_lst)

    all_Cols_Pairs = list(combinations(columns_lst, 2)) # generating pair of columns (combinations). Order of columns in a pair does not matter
  
    # printing result 
    #print("All possible pairs : " , all_Cols_Pairs)

    columns_name = df_selected_cols.columns # returns <class 'pandas.core.indexes.base.Index'>
    #print("column name indices: ", columns_name)

    R_List = []
    for num_Buckets in range(10, 11, 5):
        col_bucket_df(df_selected_cols, num_Buckets) # doing bucketing based on num buckets provided
    
        R_List = main_Computation('Pearson', df_selected_cols, columns_name, Dataset_Col_Associ_lst, num_Buckets)
        #main_Computation('Spearman', df_selected_cols, columns_name, Dataset_Col_Associ_lst, num_Buckets)
        #main_Computation('Kendall', df_selected_cols, columns_name, Dataset_Col_Associ_lst, num_Buckets)
    
    #print(type(columns_name))
    '''
    for col in df_selected_cols:
        print(col, columns_name.get_loc(col))
    '''
    return R_List

def main_Computation(corr_Type, df_selected_cols, columns_name, Dataset_Col_Associ_lst, num_Buckets):
    # with 3 tables. each for one correlation type   
    
    Score_Res_lst = []
    F_Score_Sorted = []
    num_Cols = len(df_selected_cols.columns)
    Score_Res_lst = Score_Prep(corr_Type, df_selected_cols, columns_name, Dataset_Col_Associ_lst)  # returns [pair[0], pair[1], Avg_corr, Score, Type, count_High_match, count_Low_match, count_No_match]
    

    sim_Pen = 0.30
    polWeath_Pen = 0.20
    polTraffic_Pen = 0.20
    weathTraffic_Pen = 0.1
    F_Score_Sorted = apply_PenaltyNSorting(Score_Res_lst, num_Cols, sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen) #([col_pair, CORR, penalty, F_Score])

    return F_Score_Sorted

    '''
    for i in range(5):
        F_Score_Sorted.clear()
        F_Score_Sorted = apply_PenaltyNSorting(Score_Res_lst, num_Cols, sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen) #([col_pair, CORR, penalty, F_Score])        
        print_Output(corr_Type, F_Score_Sorted, sim_Pen, polTraffic_Pen, polWeath_Pen, weathTraffic_Pen, num_Buckets)
        sim_Pen += 0.15
        polWeath_Pen += 0.1
        polTraffic_Pen += 0.1
        weathTraffic_Pen += 0.05
        print("\n\n\n")
    
    sim_Pen = 0.0
    polWeath_Pen = 0.0
    polTraffic_Pen = 0
    weathTraffic_Pen = 0
    for i in range(3):
        F_Score_Sorted.clear()
        F_Score_Sorted = apply_PenaltyNSorting(Score_Res_lst, num_Cols, sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen) #([col_pair, CORR, penalty, F_Score])        
        print_Output(corr_Type, F_Score_Sorted, sim_Pen, polTraffic_Pen, polWeath_Pen, weathTraffic_Pen, num_Buckets)        
        sim_Pen += 0.3
        polWeath_Pen += 0.2
        polTraffic_Pen += 0.0
        weathTraffic_Pen += 0.0
        print("\n\n\n")
    
    sim_Pen = 0.0
    polWeath_Pen = 0.0
    polTraffic_Pen = 0
    weathTraffic_Pen = 0
    for i in range(4):
        F_Score_Sorted.clear()
        F_Score_Sorted = apply_PenaltyNSorting(Score_Res_lst, num_Cols, sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen) #([col_pair, CORR, penalty, F_Score])        
        print_Output(corr_Type, F_Score_Sorted, sim_Pen, polTraffic_Pen, polWeath_Pen, weathTraffic_Pen, num_Buckets)        
        sim_Pen += 0.2
        polWeath_Pen += 0.1
        polTraffic_Pen += 0.05
        weathTraffic_Pen += 0.0
        print("\n\n\n")
    '''

    

    
def print_Output(corr_Type, F_Score_Sorted, sim_Pen, polTraffic_Pen, polWeath_Pen, weathTraffic_Pen, num_Buckets):
    
    n = 10 #len(F_Score_Sorted)
    penalty_str = 'Similar penalty: %.2f, Pollution_Weather penalty: %.2f, Pollution_Traffic penalty: %.2f, Weather_Traffic penalty: %.2f' %(sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen)
    heading = 'COLUMN1, COLUMN2, CORRELATION, PENALTY, FINAL SCORE' +',' + corr_Type
    
    #print(penalty_str + '      -------      ' + corr_Type)
    #print('COLUMNS'.center(65), 'CORRELATION'.center(20) , 'SCORE'.center(20), 'PENALTY'.center(20), 'FINAL SCORE'.center(20))
    for k in range(n):
        print(F_Score_Sorted[k][0].center(65), str(F_Score_Sorted[k][1]).center(20), str(F_Score_Sorted[k][4]).center(20), str(F_Score_Sorted[k][2]).center(20), str(F_Score_Sorted[k][3]).ljust(25))
    
    with open('penalty-score-NEW_CORRECT_Pearson.csv', 'a') as f:
        f.write("num Buckets: " + str(num_Buckets) + '\n')
        f.write(penalty_str+'\n')
        f.write(heading+'\n')
        for k in range(n):
            line = str(F_Score_Sorted[k][0])+ ',' + str(F_Score_Sorted[k][1]) + ',' + str(F_Score_Sorted[k][2]) + ',' + str(F_Score_Sorted[k][3])
            f.write(line+'\n')
        f.write('\n')
    


def Score_Prep(corr_Type, df_selected_cols, columns_name, Dataset_Col_Associ_lst):
    
    global all_Cols_Pairs


    num_Cols = len(df_selected_cols.columns)    
    Score_lst = []  
    match_Col_lst = []

    #print('In tableDataPrep: **** Similar penalty: %.2f, Pollution_Traffic penalty: %.2f, Pollution_Weather penalty: %.2f, Weather_Traffic penalty: %.2f' %(sim_Pen, polTraffic_Pen, polWeath_Pen, weathTraffic_Pen))
    
    for pair in all_Cols_Pairs:
        count_High_match = 0
        count_Low_match = 0
        count_No_match = 0
        corr_Diff = 0 
        #print(pair[0], pair[1]) # string type
        Score = 0    
        #print(pair)
        Avg_corr, Avg_Pvalue, numBins1, numBins2 = comp_Correlation(pair[0], pair[1], corr_Type, columns_name) # returns avg corr, avg pvalue and number of bins of the two bucketed dfs
        
        impact_col1 = col_Impact(pair[0], corr_Type, columns_name)
        impact_col2 = col_Impact(pair[1], corr_Type, columns_name)
        Significane = 1 - Avg_Pvalue

        Score = (0.5 * impact_col1 + 0.5 * impact_col2) * Significane #* abs(corr)
        #Score = 0.5 * (impact_col1 + impact_col2) + 0.5 * Significane #* abs(corr)    
        #penalty_list = [()]
        #print("pair indices from column indices list", columns_name.get_loc(pair[0]), columns_name.get_loc(pair[1]))
        x = Dataset_Col_Associ_lst[columns_name.get_loc(pair[0])][1] # columns_name.get_loc(column1) returns the index from the index list (column_name) of the given column and returns the second value of a tuple
        y = Dataset_Col_Associ_lst[columns_name.get_loc(pair[1])][1]
        #print("values of x and y: ", x, y)

        Type = 0
        if x == y:
            Type = 1        
        elif x == 1 and y == 2: # Pollution vs Weather 
            Type = 2
        elif x == 1 and y == 3: # Pollution vs Traffic
            Type = 3
        elif x == 2 and y == 3: # Weather vs Traffic
            Type = 4
   


        for col_X in df_selected_cols: # for each column in the dataframe            
            if col_X != pair[0] and col_X != pair[1]:

                corr_1, _, _, _ = comp_Correlation(pair[0], col_X, corr_Type, columns_name)    
                corr_2, _, _, _ = comp_Correlation(pair[1], col_X, corr_Type, columns_name) 
                #print (col_X, corr_1, corr_2)
               
                if Avg_corr < 0:
                    #if corr_1 >= 0 and corr_2 >=0:
                    corr_1 = corr_1 * -1

                corr_Diff = abs(corr_1 - corr_2)
                if corr_Diff <= 0.2:
                    count_High_match += 1
                elif corr_Diff > 0.2 and corr_Diff <= 0.5:
                    count_Low_match += 1
                else:
                    count_No_match += 1

        Score_lst.append([pair[0], pair[1], Avg_corr, Score, Type, count_High_match, count_Low_match, count_No_match])
       
       
    return Score_lst

def apply_PenaltyNSorting(Score_lst, num_Cols, sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen):
    #print(sim_Pen, polWeath_Pen, polTraffic_Pen, weathTraffic_Pen)
    
    F_Score_lst = []
    
    for item in Score_lst: #[[pair[0], pair[1], Avg_corr, Score, Type, count_High_match, count_Low_match, count_No_match])]
        penalty = 0
        match_penalty = item[3] * (0.9 * (item[5]/num_Cols) + 0.1 * (item[6]/num_Cols) + 0.0 * (item[7]/num_Cols))
    
        #print(item)
        if item[4] == 1:
            penalty = sim_Pen
        elif item[4] == 2:
            penalty = polWeath_Pen
        elif item[4] == 3:
            #penalty =  match_penalty
            penalty = polTraffic_Pen
        elif item[4] == 4:
            #penalty = match_penalty
            penalty = weathTraffic_Pen
        #print(item[4], penalty)

        col_pair = re.sub("\(.*?\)|\[.*?\]","",item[0]) + ',' +  re.sub("\(.*?\)|\[.*?\]","",item[1]) # removing extra characters

        F_Score = item[3] - penalty # Score - Penalty

        #print('penalty: ', item[4], penalty)
        F_Score_lst.append([col_pair, item[2], penalty, F_Score, item[3]])

    return sorted(F_Score_lst, key=itemgetter(3), reverse=True)





def col_Impact(column1, corr_Type, columns_name):

    list_of_corr = []
    corr_sum = 0
    count_cols = 0
    #print("Columns list in the col_Impact: ", columns_lst)
    for column2 in columns_lst: # for each column in the dataframe
        if column2 != column1:
            corr, pvalue, _, _ = comp_Correlation(column1, column2, corr_Type, columns_name)            
            corr_sum += abs(corr) 
            if abs(corr) >= 0.5:                 
                count_cols += 1
                #list_of_corr.append([column1, column2, corr])

    impact_col = corr_sum/len(columns_lst) # dividing with total num of columns
    #impact_col = count_cols/len(columns_lst) # counting cols, dividing with total num of columns

    return impact_col

def comp_Correlation(column1, column2, corr_Type, columns_name):
    # This function computes the requested type correlation
    # Returns average correlation and P-Value

    corr_1 =0
    pvalue_1 = 0       
    corr_2 = 0
    pvalue_2 = 0
    col1_bucketed_df = pd.DataFrame()
    col2_bucketed_df = pd.DataFrame()
    #print("In comp_Correlation(): ", column1, column2)
    #print("Indeces: ", columns_name.get_loc(column1), columns_name.get_loc(column2))
    #print("Col names from the bucked list: ", df_bucks_lst[columns_name.get_loc(column1)][0], df_bucks_lst[columns_name.get_loc(column2)][0])

    col1_bucketed_df = df_bucks_lst[columns_name.get_loc(column1)][1] # columns_name.get_loc(column1) returns the index from the index list (column_name) of the given column
    col2_bucketed_df = df_bucks_lst[columns_name.get_loc(column2)][1]

    #print(col1_bucketed_df[column1], col1_bucketed_df[column2])
    #print(col2_bucketed_df[column2], col2_bucketed_df[column1])

    #print(col1_bucketed_df.to_string())
    #print(col2_bucketed_df.to_string())


    '''
    for item in df_bucks_lst: # Fetching col1 and col2 binned df
        if item[0] == column1: 
            col1_bucketed_df = item[1] 
        elif item[0] == column2: 
            col2_bucketed_df = item[1]
    '''

    if len(col1_bucketed_df) < 2 or len(col2_bucketed_df) < 2:

        return 0, 0, len(col1_bucketed_df), len(col2_bucketed_df)

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

        return Avg_Corr, Avg_Pvalue, len(col1_bucketed_df), len(col2_bucketed_df)




def col_bucket_df(df_num, num_Buckets): # creating bucket dfs for each column in advance. And later going to use them rather creating over and over agin during the computation of impact
    print("Number of Buckets: ", num_Buckets)
    global df_bucks_lst    
    df_bucks_lst.clear()
    print("IN Bucketing....", df_num.head().to_string(), file=sys.stderr)
    for column in df_num:
        print(column, len(df_num[column]), file=sys.stderr)
        df_col_buck = pd.DataFrame()
        df_sorted = df_num.sort_values(column)
        print(df_sorted.dtypes)

        uniq_val = df_sorted[column].unique()
        #print("Unique vals: ", uniq_val)
        if num_Buckets + 2 < len(uniq_val):
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
            print("in else: ", df_sorted[column])
            df_sorted['Col_Cut'] = pd.cut(df_sorted[column].astype('float'), bins = int(num_Buckets)) 
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
        df_bucks_lst.append((column, df_col_buck, numBins))


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